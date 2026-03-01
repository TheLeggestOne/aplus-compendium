import { app } from 'electron';
import Database from 'better-sqlite3';
import { readFile, readdir } from 'fs/promises';
import { join, basename } from 'path';
import type {
  CompendiumContentType,
  CompendiumEntry,
  CompendiumSearchFilters,
  CompendiumSearchResult,
  CompendiumStatus,
  CharacterDropTarget,
  ImportProgress,
} from '@aplus-compendium/types';

// ---------------------------------------------------------------------------
// DB singleton
// ---------------------------------------------------------------------------

let _db: Database.Database | null = null;

function db(): Database.Database {
  if (!_db) {
    const dbPath = join(app.getPath('userData'), 'compendium.db');
    _db = new Database(dbPath);
    _db.pragma('journal_mode = WAL');
    _db.pragma('synchronous = NORMAL');
    initSchema(_db);
  }
  return _db;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

function initSchema(d: Database.Database): void {
  d.exec(`
    CREATE TABLE IF NOT EXISTS spells (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      source      TEXT NOT NULL,
      level       INTEGER,
      school      TEXT,
      casting_time TEXT,
      concentration INTEGER,
      ritual      INTEGER,
      classes_json TEXT,
      raw_json    TEXT NOT NULL
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS spells_fts USING fts5(
      name, source, content='spells', content_rowid='rowid'
    );

    CREATE TABLE IF NOT EXISTS items (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      source        TEXT NOT NULL,
      item_type     TEXT,
      character_type TEXT,
      rarity        TEXT,
      requires_attunement INTEGER,
      raw_json      TEXT NOT NULL
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS items_fts USING fts5(
      name, source, content='items', content_rowid='rowid'
    );

    CREATE TABLE IF NOT EXISTS feats (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      source       TEXT NOT NULL,
      prerequisite TEXT,
      raw_json     TEXT NOT NULL
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS feats_fts USING fts5(
      name, source, content='feats', content_rowid='rowid'
    );

    CREATE TABLE IF NOT EXISTS backgrounds (
      id       TEXT PRIMARY KEY,
      name     TEXT NOT NULL,
      source   TEXT NOT NULL,
      raw_json TEXT NOT NULL
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS backgrounds_fts USING fts5(
      name, source, content='backgrounds', content_rowid='rowid'
    );

    CREATE TABLE IF NOT EXISTS races (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      source     TEXT NOT NULL,
      subrace_of TEXT,
      raw_json   TEXT NOT NULL
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS races_fts USING fts5(
      name, source, subrace_of, content='races', content_rowid='rowid'
    );

    CREATE TABLE IF NOT EXISTS classes (
      id       TEXT PRIMARY KEY,
      name     TEXT NOT NULL,
      source   TEXT NOT NULL,
      raw_json TEXT NOT NULL
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS classes_fts USING fts5(
      name, source, content='classes', content_rowid='rowid'
    );

    CREATE TABLE IF NOT EXISTS subclasses (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      source     TEXT NOT NULL,
      class_name TEXT NOT NULL,
      raw_json   TEXT NOT NULL
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS subclasses_fts USING fts5(
      name, source, class_name, content='subclasses', content_rowid='rowid'
    );

    CREATE TABLE IF NOT EXISTS optional_features (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      source       TEXT NOT NULL,
      feature_type TEXT,
      raw_json     TEXT NOT NULL
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS optional_features_fts USING fts5(
      name, source, content='optional_features', content_rowid='rowid'
    );

    CREATE TABLE IF NOT EXISTS conditions (
      id       TEXT PRIMARY KEY,
      name     TEXT NOT NULL,
      source   TEXT NOT NULL,
      raw_json TEXT NOT NULL
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS conditions_fts USING fts5(
      name, source, content='conditions', content_rowid='rowid'
    );

    CREATE TABLE IF NOT EXISTS meta (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export function getCompendiumStatus(): CompendiumStatus {
  const d = db();
  const importedAt = (d.prepare('SELECT value FROM meta WHERE key = ?').get('imported_at') as { value: string } | undefined)?.value;

  if (!importedAt) return { imported: false, counts: {} };

  const counts: Partial<Record<CompendiumContentType, number>> = {};
  const tables: Array<[string, CompendiumContentType]> = [
    ['spells', 'spell'],
    ['items', 'item'],
    ['feats', 'feat'],
    ['backgrounds', 'background'],
    ['races', 'race'],
    ['classes', 'class'],
    ['subclasses', 'subclass'],
    ['optional_features', 'optional-feature'],
    ['conditions', 'condition'],
  ];
  for (const [table, type] of tables) {
    const row = d.prepare(`SELECT COUNT(*) as n FROM ${table}`).get() as { n: number };
    counts[type] = row.n;
  }
  return { imported: true, importedAt, counts };
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

// 5etools school codes → readable names
const SCHOOL_MAP: Record<string, string> = {
  A: 'Abjuration', C: 'Conjuration', D: 'Divination', E: 'Enchantment',
  V: 'Evocation', I: 'Illusion', N: 'Necromancy', T: 'Transmutation',
  P: 'Psionic',
};

// 5etools item type → character drop target
function itemDropTarget(typeCode: string | undefined): CharacterDropTarget {
  if (!typeCode) return 'equipment';
  if (['W', 'EWP', 'M', 'R'].includes(typeCode)) return 'weapon';
  if (['LA', 'MA', 'HA', 'S'].includes(typeCode)) return 'armor';
  return 'equipment';
}

// Extract readable prerequisite from feat data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPrerequisite(feat: any): string | undefined {
  if (!feat.prerequisite) return undefined;
  const parts: string[] = [];
  for (const prereq of feat.prerequisite) {
    if (prereq.level) parts.push(`Level ${prereq.level.level}`);
    if (prereq.ability) {
      for (const [ab, score] of Object.entries(prereq.ability as Record<string, number>)) {
        parts.push(`${ab.toUpperCase()} ${score}+`);
      }
    }
    if (prereq.race) parts.push(prereq.race.map((r: { name: string }) => r.name).join(' or '));
    if (prereq.spellcasting) parts.push('Spellcasting');
    if (prereq.proficiency) parts.push('Proficiency');
  }
  return parts.length ? parts.join(', ') : undefined;
}

// Extract class names from spell data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractSpellClasses(spell: any): string[] {
  const seen = new Set<string>();
  const classes: string[] = [];
  const push = (name: string) => { if (name && !seen.has(name)) { seen.add(name); classes.push(name); } };
  if (spell.classes?.fromClassList) {
    for (const c of spell.classes.fromClassList) push(c.name);
  }
  if (spell.classes?.fromClassListVariant) {
    for (const c of spell.classes.fromClassListVariant) push(c.name);
  }
  if (spell.classes?.fromSubclass) {
    for (const s of spell.classes.fromSubclass) push(s.class.name);
  }
  return [...new Set(classes)];
}

// Extract casting time as a string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractCastingTime(spell: any): string | undefined {
  if (!spell.time?.length) return undefined;
  const t = spell.time[0];
  return `${t.number} ${t.unit}`;
}

// ---------------------------------------------------------------------------
// sources.json class repair
// ---------------------------------------------------------------------------
// Format: sources.json[SOURCE_CODE][Spell Name].class / .classVariant = [{name: string, source: string}[]]
// Note: XGE and later sources use "classVariant" instead of (or in addition to) "class".

export async function loadSpellClassesFromSources(dirPath: string): Promise<number> {
  const d = db();
  let raw: string;
  try {
    raw = await readFile(join(dirPath, 'spells', 'sources.json'), 'utf-8');
  } catch {
    return 0; // file not present — silently skip
  }

  type ClassEntry = { name: string; source: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sources = JSON.parse(raw) as Record<string, Record<string, { class?: ClassEntry[]; classVariant?: ClassEntry[] }>>;

  // Build a map: "SpellName|SOURCE" → Set<className>
  const classMap = new Map<string, Set<string>>();
  for (const [sourceCode, spells] of Object.entries(sources)) {
    for (const [spellName, data] of Object.entries(spells)) {
      const allEntries = [...(data.class ?? []), ...(data.classVariant ?? [])];
      if (allEntries.length === 0) continue;
      const id = `${spellName}|${sourceCode}`;
      const set = classMap.get(id) ?? new Set<string>();
      for (const c of allEntries) {
        if (c.name) set.add(c.name);
      }
      classMap.set(id, set);
    }
  }

  if (classMap.size === 0) return 0;

  const update = d.prepare('UPDATE spells SET classes_json = ? WHERE id = ?');
  let updated = 0;
  d.transaction(() => {
    for (const [id, classSet] of classMap) {
      const classes = [...classSet];
      const r = update.run(JSON.stringify(classes), id);
      if (r.changes > 0) updated++;
    }
  })();
  return updated;
}

export type ProgressCallback = (progress: ImportProgress) => void;

export function clearCompendium(): void {
  const d = db();
  const tables = ['spells', 'items', 'feats', 'backgrounds', 'races', 'classes', 'subclasses', 'optional_features', 'conditions'];
  d.transaction(() => {
    for (const t of [...tables, ...tables.map(t => `${t}_fts`)]) {
      d.prepare(`DELETE FROM ${t}`).run();
    }
    d.prepare("DELETE FROM meta WHERE key = 'imported_at'").run();
  })();
}

export async function importCompendium(dirPath: string, onProgress: ProgressCallback): Promise<void> {
  const d = db();

  // Clear existing data
  const tables = ['spells', 'items', 'feats', 'backgrounds', 'races', 'classes', 'subclasses', 'optional_features', 'conditions'];
  const ftsTables = tables.map(t => `${t}_fts`);
  for (const t of [...tables, ...ftsTables]) {
    d.prepare(`DELETE FROM ${t}`).run();
  }
  d.prepare("DELETE FROM meta WHERE key != 'imported_at'").run();

  await importSpells(d, dirPath, onProgress);
  await importItems(d, dirPath, onProgress);
  await importFeats(d, dirPath, onProgress);
  await importBackgrounds(d, dirPath, onProgress);
  await importRaces(d, dirPath, onProgress);
  await importClasses(d, dirPath, onProgress);
  await importOptionalFeatures(d, dirPath, onProgress);
  await importConditions(d, dirPath, onProgress);

  // Patch classes_json from spells/sources.json if present (takes priority over
  // inline fromClassList in the spell JSON, and covers sources that don't embed it)
  await loadSpellClassesFromSources(dirPath);

  // Rebuild FTS indexes
  for (const t of tables) {
    d.prepare(`INSERT INTO ${t}_fts(${t}_fts) VALUES('rebuild')`).run();
  }

  d.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES ('imported_at', ?)").run(new Date().toISOString());

  onProgress({ stage: 'done', current: 0, total: 0, done: true });
}

async function importSpells(d: Database.Database, dirPath: string, onProgress: ProgressCallback): Promise<void> {
  const spellsDir = join(dirPath, 'spells');
  let files: string[];
  try {
    files = await readdir(spellsDir);
  } catch {
    onProgress({ stage: 'spells', current: 0, total: 0, done: false, error: 'spells/ directory not found' });
    return;
  }

  const spellFiles = files.filter(f => f.startsWith('spells-') && f.endsWith('.json'));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allSpells: any[] = [];

  for (const file of spellFiles) {
    try {
      const raw = await readFile(join(spellsDir, file), 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.spell)) allSpells.push(...parsed.spell.filter((s: { name?: string }) => s.name));
    } catch { /* skip bad files */ }
  }

  onProgress({ stage: 'spells', current: 0, total: allSpells.length, done: false });

  const insert = d.prepare(`
    INSERT OR REPLACE INTO spells (id, name, source, level, school, casting_time, concentration, ritual, classes_json, raw_json)
    VALUES (@id, @name, @source, @level, @school, @casting_time, @concentration, @ritual, @classes_json, @raw_json)
  `);

  const insertMany = d.transaction(() => {
    let i = 0;
    for (const spell of allSpells) {
      const classes = extractSpellClasses(spell);
      insert.run({
        id: `${spell.name}|${spell.source}`,
        name: spell.name,
        source: spell.source ?? '',
        level: spell.level ?? 0,
        school: SCHOOL_MAP[spell.school] ?? spell.school ?? null,
        casting_time: extractCastingTime(spell) ?? null,
        concentration: spell.duration?.some((d: { concentration?: boolean }) => d.concentration) ? 1 : 0,
        ritual: spell.meta?.ritual ? 1 : 0,
        classes_json: JSON.stringify(classes),
        raw_json: JSON.stringify(spell),
      });
      if (++i % 500 === 0) onProgress({ stage: 'spells', current: i, total: allSpells.length, done: false });
    }
  });
  insertMany();
  onProgress({ stage: 'spells', current: allSpells.length, total: allSpells.length, done: false });
}

async function importItems(d: Database.Database, dirPath: string, onProgress: ProgressCallback): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allItems: any[] = [];

  for (const file of ['items.json', 'items-base.json', 'magicvariants.json']) {
    try {
      const raw = await readFile(join(dirPath, file), 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.item)) allItems.push(...parsed.item.filter((x: { name?: string }) => x.name));
      if (Array.isArray(parsed.baseitem)) allItems.push(...parsed.baseitem.filter((x: { name?: string }) => x.name));
      if (Array.isArray(parsed.variant)) allItems.push(...parsed.variant.filter((x: { name?: string }) => x.name));
    } catch { /* skip missing files */ }
  }

  onProgress({ stage: 'items', current: 0, total: allItems.length, done: false });

  const insert = d.prepare(`
    INSERT OR REPLACE INTO items (id, name, source, item_type, character_type, rarity, requires_attunement, raw_json)
    VALUES (@id, @name, @source, @item_type, @character_type, @rarity, @requires_attunement, @raw_json)
  `);

  const insertMany = d.transaction(() => {
    let i = 0;
    for (const item of allItems) {
      const typeCode = item.type as string | undefined;
      insert.run({
        id: `${item.name}|${item.source}`,
        name: item.name,
        source: item.source ?? '',
        item_type: typeCode ?? null,
        character_type: itemDropTarget(typeCode),
        rarity: item.rarity ?? null,
        requires_attunement: item.reqAttune ? 1 : 0,
        raw_json: JSON.stringify(item),
      });
      if (++i % 500 === 0) onProgress({ stage: 'items', current: i, total: allItems.length, done: false });
    }
  });
  insertMany();
  onProgress({ stage: 'items', current: allItems.length, total: allItems.length, done: false });
}

async function importFeats(d: Database.Database, dirPath: string, onProgress: ProgressCallback): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let feats: any[] = [];
  try {
    const raw = await readFile(join(dirPath, 'feats.json'), 'utf-8');
    feats = (JSON.parse(raw).feat ?? []).filter((x: { name?: string }) => x.name);
  } catch { return; }

  onProgress({ stage: 'feats', current: 0, total: feats.length, done: false });

  const insert = d.prepare(`
    INSERT OR REPLACE INTO feats (id, name, source, prerequisite, raw_json)
    VALUES (@id, @name, @source, @prerequisite, @raw_json)
  `);

  d.transaction(() => {
    for (const feat of feats) {
      insert.run({
        id: `${feat.name}|${feat.source}`,
        name: feat.name,
        source: feat.source ?? '',
        prerequisite: extractPrerequisite(feat) ?? null,
        raw_json: JSON.stringify(feat),
      });
    }
  })();
  onProgress({ stage: 'feats', current: feats.length, total: feats.length, done: false });
}

async function importBackgrounds(d: Database.Database, dirPath: string, onProgress: ProgressCallback): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let backgrounds: any[] = [];
  try {
    const raw = await readFile(join(dirPath, 'backgrounds.json'), 'utf-8');
    backgrounds = (JSON.parse(raw).background ?? []).filter((x: { name?: string }) => x.name);
  } catch { return; }

  onProgress({ stage: 'backgrounds', current: 0, total: backgrounds.length, done: false });

  const insert = d.prepare(`
    INSERT OR REPLACE INTO backgrounds (id, name, source, raw_json)
    VALUES (@id, @name, @source, @raw_json)
  `);

  d.transaction(() => {
    for (const bg of backgrounds) {
      insert.run({
        id: `${bg.name}|${bg.source}`,
        name: bg.name,
        source: bg.source ?? '',
        raw_json: JSON.stringify(bg),
      });
    }
  })();
  onProgress({ stage: 'backgrounds', current: backgrounds.length, total: backgrounds.length, done: false });
}

async function importRaces(d: Database.Database, dirPath: string, onProgress: ProgressCallback): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let races: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let subraces: any[] = [];
  try {
    const raw = await readFile(join(dirPath, 'races.json'), 'utf-8');
    const parsed = JSON.parse(raw);
    races = (parsed.race ?? []).filter((r: { name?: string }) => r.name);
    subraces = (parsed.subrace ?? []).filter((r: { name?: string }) => r.name);
  } catch { return; }

  const total = races.length + subraces.length;
  onProgress({ stage: 'races', current: 0, total, done: false });

  const insert = d.prepare(`
    INSERT OR REPLACE INTO races (id, name, source, subrace_of, raw_json)
    VALUES (@id, @name, @source, @subrace_of, @raw_json)
  `);

  d.transaction(() => {
    for (const race of races) {
      insert.run({
        id: `${race.name}|${race.source}`,
        name: race.name,
        source: race.source ?? '',
        subrace_of: null,
        raw_json: JSON.stringify(race),
      });
    }
    for (const sr of subraces) {
      insert.run({
        id: `${sr.name}|${sr.source}`,
        name: sr.name,
        source: sr.source ?? '',
        subrace_of: sr.raceName ?? null,
        raw_json: JSON.stringify(sr),
      });
    }
  })();
  onProgress({ stage: 'races', current: total, total, done: false });
}

async function importClasses(d: Database.Database, dirPath: string, onProgress: ProgressCallback): Promise<void> {
  const classDir = join(dirPath, 'class');
  let files: string[];
  try {
    files = await readdir(classDir);
  } catch { return; }

  const classFiles = files.filter(f => f.startsWith('class-') && f.endsWith('.json'));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allClasses: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allSubclasses: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allClassFeatures: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allSubclassFeatures: any[] = [];

  for (const file of classFiles) {
    try {
      const raw = await readFile(join(classDir, file), 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.class)) allClasses.push(...parsed.class.filter((x: { name?: string }) => x.name));
      if (Array.isArray(parsed.subclass)) allSubclasses.push(...parsed.subclass.filter((x: { name?: string }) => x.name));
      if (Array.isArray(parsed.classFeature)) allClassFeatures.push(...parsed.classFeature);
      if (Array.isArray(parsed.subclassFeature)) allSubclassFeatures.push(...parsed.subclassFeature);
    } catch { /* skip */ }
  }

  // Embed feature descriptions into class/subclass JSON for single-query retrieval
  for (const cls of allClasses) {
    cls._classFeatureEntries = allClassFeatures.filter(
      (f: { className?: string; classSource?: string }) =>
        f.className === cls.name && f.classSource === cls.source,
    );
  }
  for (const sc of allSubclasses) {
    // Match on className + shortName + subclassSource only — skip classSource because
    // INSERT OR REPLACE can overwrite the entry with a cross-reference variant that has
    // a different classSource (e.g. PHB subclass cross-ref'd to XPHB class).
    sc._subclassFeatureEntries = allSubclassFeatures.filter(
      (f: { className?: string; subclassShortName?: string; subclassSource?: string }) =>
        f.className === sc.className
        && f.subclassShortName === sc.shortName && f.subclassSource === sc.source,
    );
  }

  const total = allClasses.length + allSubclasses.length;
  onProgress({ stage: 'classes', current: 0, total, done: false });

  const insertClass = d.prepare(`
    INSERT OR REPLACE INTO classes (id, name, source, raw_json)
    VALUES (@id, @name, @source, @raw_json)
  `);
  const insertSubclass = d.prepare(`
    INSERT OR REPLACE INTO subclasses (id, name, source, class_name, raw_json)
    VALUES (@id, @name, @source, @class_name, @raw_json)
  `);

  d.transaction(() => {
    for (const cls of allClasses) {
      insertClass.run({
        id: `${cls.name}|${cls.source}`,
        name: cls.name,
        source: cls.source ?? '',
        raw_json: JSON.stringify(cls),
      });
    }
    for (const sc of allSubclasses) {
      insertSubclass.run({
        id: `${sc.name}|${sc.source}`,
        name: sc.name,
        source: sc.source ?? '',
        class_name: sc.className ?? '',
        raw_json: JSON.stringify(sc),
      });
    }
  })();
  onProgress({ stage: 'classes', current: total, total, done: false });
}

async function importOptionalFeatures(d: Database.Database, dirPath: string, onProgress: ProgressCallback): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let features: any[] = [];
  try {
    const raw = await readFile(join(dirPath, 'optionalfeatures.json'), 'utf-8');
    features = (JSON.parse(raw).optionalfeature ?? []).filter((x: { name?: string }) => x.name);
  } catch { return; }

  onProgress({ stage: 'optional-features', current: 0, total: features.length, done: false });

  const insert = d.prepare(`
    INSERT OR REPLACE INTO optional_features (id, name, source, feature_type, raw_json)
    VALUES (@id, @name, @source, @feature_type, @raw_json)
  `);

  d.transaction(() => {
    for (const f of features) {
      insert.run({
        id: `${f.name}|${f.source}`,
        name: f.name,
        source: f.source ?? '',
        feature_type: Array.isArray(f.featureType) ? f.featureType[0] : (f.featureType ?? null),
        raw_json: JSON.stringify(f),
      });
    }
  })();
  onProgress({ stage: 'optional-features', current: features.length, total: features.length, done: false });
}

async function importConditions(d: Database.Database, dirPath: string, onProgress: ProgressCallback): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let entries: any[] = [];
  try {
    const raw = await readFile(join(dirPath, 'conditionsdiseases.json'), 'utf-8');
    const parsed = JSON.parse(raw);
    entries = [
      ...(parsed.condition ?? []).filter((x: { name?: string }) => x.name),
      ...(parsed.disease ?? []).filter((x: { name?: string }) => x.name),
    ];
  } catch { return; }

  onProgress({ stage: 'conditions', current: 0, total: entries.length, done: false });

  const insert = d.prepare(`
    INSERT OR REPLACE INTO conditions (id, name, source, raw_json)
    VALUES (@id, @name, @source, @raw_json)
  `);

  d.transaction(() => {
    for (const e of entries) {
      insert.run({
        id: `${e.name}|${e.source}`,
        name: e.name,
        source: e.source ?? '',
        raw_json: JSON.stringify(e),
      });
    }
  })();
  onProgress({ stage: 'conditions', current: entries.length, total: entries.length, done: false });
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

// Content type → table + column config
const TABLE_CONFIG: Record<CompendiumContentType, {
  table: string;
  fts: string;
  extraCols: string;
  toResult: (row: Record<string, unknown>) => Partial<CompendiumSearchResult>;
  dropTarget: (row: Record<string, unknown>) => CharacterDropTarget | null;
}> = {
  spell: {
    table: 'spells', fts: 'spells_fts',
    extraCols: ', level, school, casting_time, concentration, ritual, classes_json',
    toResult: (r) => ({
      level: r['level'] as number,
      school: r['school'] as string,
      castingTime: r['casting_time'] as string,
      concentration: (r['concentration'] as number) === 1,
      ritual: (r['ritual'] as number) === 1,
    }),
    dropTarget: () => 'spell',
  },
  item: {
    table: 'items', fts: 'items_fts',
    extraCols: ', item_type, character_type, rarity, requires_attunement',
    toResult: (r) => ({ itemType: r['item_type'] as string, rarity: r['rarity'] as string }),
    dropTarget: (r) => r['character_type'] as CharacterDropTarget,
  },
  feat: {
    table: 'feats', fts: 'feats_fts',
    extraCols: ', prerequisite',
    toResult: (r) => ({ prerequisite: r['prerequisite'] as string }),
    dropTarget: () => 'feature',
  },
  background: {
    table: 'backgrounds', fts: 'backgrounds_fts',
    extraCols: '',
    toResult: () => ({}),
    dropTarget: () => null,
  },
  race: {
    table: 'races', fts: 'races_fts',
    extraCols: ', subrace_of',
    toResult: (r) => ({
      subraceOf: (r['subrace_of'] as string) || undefined,
    }),
    dropTarget: () => null,
  },
  class: {
    table: 'classes', fts: 'classes_fts',
    extraCols: '',
    toResult: () => ({}),
    dropTarget: () => null,
  },
  subclass: {
    table: 'subclasses', fts: 'subclasses_fts',
    extraCols: ', class_name',
    toResult: (r) => ({ className: r['class_name'] as string }),
    dropTarget: () => null,
  },
  'optional-feature': {
    table: 'optional_features', fts: 'optional_features_fts',
    extraCols: ', feature_type',
    toResult: (r) => ({ featureType: r['feature_type'] as string }),
    dropTarget: () => 'feature',
  },
  condition: {
    table: 'conditions', fts: 'conditions_fts',
    extraCols: '',
    toResult: () => ({}),
    dropTarget: () => null,
  },
};

export function searchCompendium(
  query: string,
  contentType: CompendiumContentType,
  filters: CompendiumSearchFilters,
  limit = 50,
  offset = 0,
): CompendiumSearchResult[] {
  const d = db();
  const cfg = TABLE_CONFIG[contentType];
  const params: (string | number)[] = [];
  const where: string[] = [];

  // FTS query — use t.rowid (INTEGER) not t.id (TEXT); content_rowid is the integer rowid.
  // Each word gets a prefix wildcard ("word"*) so typing "fire" matches "fireball", etc.
  if (query.trim()) {
    const terms = query.trim().replace(/['"]/g, '').split(/\s+/).filter(Boolean);
    where.push(`t.rowid IN (SELECT rowid FROM ${cfg.fts} WHERE ${cfg.fts} MATCH ?)`);
    params.push(terms.map(t => `"${t}"*`).join(' '));
  }

  // Filters
  if (filters.source?.length) {
    where.push(`t.source IN (${filters.source.map(() => '?').join(',')})`);
    params.push(...filters.source);
  }

  if (contentType === 'spell') {
    if (filters.level?.length) {
      where.push(`t.level IN (${filters.level.map(() => '?').join(',')})`);
      params.push(...filters.level);
    }
    if (filters.school?.length) {
      where.push(`t.school IN (${filters.school.map(() => '?').join(',')})`);
      params.push(...filters.school);
    }
    if (filters.ritual !== undefined) {
      where.push('t.ritual = ?');
      params.push(filters.ritual ? 1 : 0);
    }
    if (filters.concentration !== undefined) {
      where.push('t.concentration = ?');
      params.push(filters.concentration ? 1 : 0);
    }
    // Class filter: classes_json contains the class name
    if (filters.classes?.length) {
      const classWhere = filters.classes.map(() => "t.classes_json LIKE ?").join(' OR ');
      where.push(`(${classWhere})`);
      params.push(...filters.classes.map(c => `%"${c}"%`));
    }
  }

  if (contentType === 'item') {
    if (filters.rarity?.length) {
      where.push(`t.rarity IN (${filters.rarity.map(() => '?').join(',')})`);
      params.push(...filters.rarity);
    }
    if (filters.requiresAttunement !== undefined) {
      where.push('t.requires_attunement = ?');
      params.push(filters.requiresAttunement ? 1 : 0);
    }
  }

  if (contentType === 'optional-feature' && filters.featureType?.length) {
    where.push(`t.feature_type IN (${filters.featureType.map(() => '?').join(',')})`);
    params.push(...filters.featureType);
  }

  // Races: when browsing (no query), only show base races — subraces are nested in the detail view.
  // When searching, allow subraces to appear so users can find them by name.
  if (contentType === 'race' && !query.trim()) {
    where.push('t.subrace_of IS NULL');
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sql = `
    SELECT t.id, t.name, t.source ${cfg.extraCols}
    FROM ${cfg.table} t
    ${whereClause}
    ORDER BY t.name
    LIMIT ? OFFSET ?
  `;
  params.push(limit, offset);

  const rows = d.prepare(sql).all(...params) as Record<string, unknown>[];

  return rows.map((row) => ({
    id: row['id'] as string,
    name: row['name'] as string,
    source: row['source'] as string,
    contentType,
    dropTarget: cfg.dropTarget(row),
    ...cfg.toResult(row),
  }));
}

export function getCompendiumEntry(id: string, contentType: CompendiumContentType): CompendiumEntry | null {
  const d = db();
  const cfg = TABLE_CONFIG[contentType];
  const row = d.prepare(`SELECT * FROM ${cfg.table} WHERE id = ?`).get(id) as Record<string, unknown> | undefined;
  if (!row) return null;

  return {
    id: row['id'] as string,
    name: row['name'] as string,
    source: row['source'] as string,
    contentType,
    dropTarget: cfg.dropTarget(row),
    ...cfg.toResult(row),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    raw: JSON.parse(row['raw_json'] as string) as Record<string, any>,
  };
}

// Convenience: list all distinct sources for a content type (for filter dropdowns)
export function listSources(contentType: CompendiumContentType): string[] {
  const d = db();
  const cfg = TABLE_CONFIG[contentType];
  const rows = d.prepare(`SELECT DISTINCT source FROM ${cfg.table} ORDER BY source`).all() as { source: string }[];
  return rows.map(r => r.source);
}

// Fetch all subraces for a given base race name
export function getSubraces(raceName: string): CompendiumSearchResult[] {
  const d = db();
  const rows = d.prepare(
    'SELECT id, name, source, subrace_of FROM races WHERE subrace_of = ? ORDER BY name',
  ).all(raceName) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: row['id'] as string,
    name: row['name'] as string,
    source: row['source'] as string,
    contentType: 'race' as CompendiumContentType,
    dropTarget: null,
    subraceOf: row['subrace_of'] as string,
  }));
}

// Fetch all subclasses for a given class name
export function getSubclasses(className: string): CompendiumSearchResult[] {
  const d = db();
  const rows = d.prepare(
    'SELECT id, name, source, class_name FROM subclasses WHERE class_name = ? ORDER BY source, name',
  ).all(className) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: row['id'] as string,
    name: row['name'] as string,
    source: row['source'] as string,
    contentType: 'subclass' as CompendiumContentType,
    dropTarget: null,
    className: row['class_name'] as string,
  }));
}

export interface ClassFeatureRaw {
  name: string;
  entries: unknown[];
  source: string;
  isSubclass: boolean;
}

// Fetch class (and optionally subclass) features for a specific class level
export function getClassFeaturesByLevel(
  className: string,
  classLevel: number,
  subclassName?: string,
): ClassFeatureRaw[] {
  const d = db();
  const results: ClassFeatureRaw[] = [];

  // Class features
  const classRow = d.prepare(
    'SELECT raw_json FROM classes WHERE name = ? ORDER BY source LIMIT 1',
  ).get(className) as { raw_json: string } | undefined;

  if (classRow) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cls = JSON.parse(classRow.raw_json) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries: any[] = cls._classFeatureEntries ?? [];
    for (const f of entries) {
      if (f.level === classLevel) {
        results.push({
          name: f.name as string,
          entries: Array.isArray(f.entries) ? (f.entries as unknown[]) : [],
          source: (f.source as string) ?? '',
          isSubclass: false,
        });
      }
    }
  }

  // Subclass features
  if (subclassName) {
    const scRow = d.prepare(
      'SELECT raw_json FROM subclasses WHERE name = ? AND class_name = ? ORDER BY source LIMIT 1',
    ).get(subclassName, className) as { raw_json: string } | undefined;

    if (scRow) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sc = JSON.parse(scRow.raw_json) as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entries: any[] = sc._subclassFeatureEntries ?? [];
      for (const f of entries) {
        if (f.level === classLevel) {
          results.push({
            name: f.name as string,
            entries: Array.isArray(f.entries) ? (f.entries as unknown[]) : [],
            source: (f.source as string) ?? '',
            isSubclass: true,
          });
        }
      }
    }
  }

  return results;
}

// Diagnostic: show what class data is actually stored
export function debugSpellClasses(): { total: number; withClasses: number; sample: { name: string; classes_json: string }[] } {
  const d = db();
  const total = (d.prepare('SELECT COUNT(*) as n FROM spells').get() as { n: number }).n;
  const withClasses = (d.prepare("SELECT COUNT(*) as n FROM spells WHERE classes_json != '[]' AND classes_json IS NOT NULL").get() as { n: number }).n;
  const sample = d.prepare('SELECT name, classes_json FROM spells ORDER BY name LIMIT 5').all() as { name: string; classes_json: string }[];
  return { total, withClasses, sample };
}

// Post-import fix: re-extract classes_json from raw_json for spells that had no class data
// This handles 5etools data builds that embed class lists in the spell JSON
export function repairSpellClasses(): number {
  const d = db();
  const rows = d.prepare("SELECT id, raw_json FROM spells WHERE classes_json = '[]' OR classes_json IS NULL").all() as { id: string; raw_json: string }[];
  if (rows.length === 0) return 0;

  const update = d.prepare('UPDATE spells SET classes_json = ? WHERE id = ?');
  let fixed = 0;
  d.transaction(() => {
    for (const row of rows) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spell = JSON.parse(row.raw_json) as any;
      const classes = extractSpellClasses(spell);
      if (classes.length > 0) {
        update.run(JSON.stringify(classes), row.id);
        fixed++;
      }
    }
  })();
  return fixed;
}

// unused import suppression
void basename;
