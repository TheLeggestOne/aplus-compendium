import { renderInline } from './tag-renderer.js';

// ---------------------------------------------------------------------------
// Types for parsed class data
// ---------------------------------------------------------------------------

export interface ClassFeatureRef {
  name: string;
  level: number;
  isSubclassFeature: boolean;
}

export interface ProgressionRow {
  level: number;
  profBonus: string;
  features: ClassFeatureRef[];
  /** Extra columns from classTableGroups (spell slots, ki points, etc.) */
  extraCells: string[];
}

export interface ClassFeatureEntry {
  name: string;
  source: string;
  level: number;
  entries: unknown[];
}

// ---------------------------------------------------------------------------
// Proficiency abbreviation map
// ---------------------------------------------------------------------------

const ABILITY_ABBR: Record<string, string> = {
  str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA',
};

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

/**
 * Parse a classFeatures reference (string or object) into structured data.
 *
 * String format: "Feature Name|ClassName|Source|Level"
 * Object format: { classFeature: "...|...|...|Level", gainSubclassFeature: true }
 */
export function parseClassFeatureRef(
  ref: string | { classFeature: string; gainSubclassFeature?: boolean },
): ClassFeatureRef {
  const isObj = typeof ref === 'object';
  const raw = isObj ? ref.classFeature : ref;
  const parts = raw.split('|');
  return {
    name: parts[0] ?? '',
    level: parseInt(parts[3] ?? '0', 10),
    isSubclassFeature: isObj && !!ref.gainSubclassFeature,
  };
}

/**
 * Build the 20-row class progression table from raw class JSON.
 */
export function buildProgressionTable(
  classRaw: Record<string, unknown>,
): { rows: ProgressionRow[]; extraColLabels: string[] } {
  const classFeatures = classRaw['classFeatures'] as (string | { classFeature: string; gainSubclassFeature?: boolean })[] | undefined;

  // Parse all feature refs and group by level
  const featuresByLevel = new Map<number, ClassFeatureRef[]>();
  for (const ref of classFeatures ?? []) {
    const parsed = parseClassFeatureRef(ref);
    const list = featuresByLevel.get(parsed.level) ?? [];
    list.push(parsed);
    featuresByLevel.set(parsed.level, list);
  }

  // Build extra columns from classTableGroups
  const tableGroups = classRaw['classTableGroups'] as {
    title?: string;
    colLabels?: string[];
    rows?: unknown[][];
    rowsSpellProgression?: number[][];
  }[] | undefined;

  const extraColLabels: string[] = [];
  const extraColData: string[][] = []; // [colIndex][rowIndex] = rendered cell

  for (const group of tableGroups ?? []) {
    const labels = group.colLabels ?? [];
    const groupRows = group.rowsSpellProgression ?? group.rows ?? [];

    for (let colIdx = 0; colIdx < labels.length; colIdx++) {
      extraColLabels.push(renderInline(labels[colIdx] ?? ''));
      const colCells: string[] = [];
      for (let rowIdx = 0; rowIdx < 20; rowIdx++) {
        const row = groupRows[rowIdx];
        const cell = row ? row[colIdx] : undefined;
        colCells.push(formatTableCell(cell));
      }
      extraColData.push(colCells);
    }
  }

  // Build the 20 rows
  const rows: ProgressionRow[] = [];
  for (let level = 1; level <= 20; level++) {
    const profBonus = `+${Math.floor((level - 1) / 4) + 2}`;
    const features = featuresByLevel.get(level) ?? [];
    const extraCells = extraColData.map((col) => col[level - 1] ?? '');
    rows.push({ level, profBonus, features, extraCells });
  }

  return { rows, extraColLabels };
}

/**
 * Format a single table cell value (number, string with tags, dice object, etc.)
 */
function formatTableCell(cell: unknown): string {
  if (cell === undefined || cell === null) return '\u2014';
  if (typeof cell === 'number') return cell === 0 ? '\u2014' : String(cell);
  if (typeof cell === 'string') return renderInline(cell);
  if (typeof cell === 'object') {
    const obj = cell as Record<string, unknown>;
    // Dice type: { type: 'dice', toRoll: [{number, faces}] }
    if (obj['type'] === 'dice' && Array.isArray(obj['toRoll'])) {
      const dice = obj['toRoll'] as { number: number; faces: number }[];
      return dice.map((d) => `${d.number}d${d.faces}`).join(' + ');
    }
    // Bonus speed: { type: 'bonusSpeed', value: 10 }
    if (obj['type'] === 'bonusSpeed') {
      const val = obj['value'] as number;
      return val === 0 ? '\u2014' : `+${val} ft.`;
    }
    // Bonus type (generic): { type: 'bonus', value: N }
    if (obj['type'] === 'bonus') {
      const val = obj['value'] as number;
      return val > 0 ? `+${val}` : String(val);
    }
  }
  return String(cell);
}

/**
 * Group _classFeatureEntries by level for the feature descriptions section.
 */
export function groupFeaturesByLevel(
  featureEntries: unknown[],
): Map<number, ClassFeatureEntry[]> {
  const map = new Map<number, ClassFeatureEntry[]>();
  for (const raw of featureEntries) {
    const f = raw as ClassFeatureEntry;
    if (!f.level || !f.entries) continue;
    const list = map.get(f.level) ?? [];
    list.push(f);
    map.set(f.level, list);
  }
  return map;
}

/**
 * Extract the saving throw proficiency abbreviations from a class.
 */
export function extractSavingThrows(classRaw: Record<string, unknown>): string {
  const profs = classRaw['proficiency'] as string[] | undefined;
  if (!profs) return '';
  return profs.map((p) => ABILITY_ABBR[p] ?? p.toUpperCase()).join(', ');
}

/**
 * Extract hit die string (e.g. "1d10").
 */
export function extractHitDie(classRaw: Record<string, unknown>): string {
  const hd = classRaw['hd'] as { number: number; faces: number } | undefined;
  if (!hd) return '';
  return `${hd.number}d${hd.faces}`;
}

/**
 * Extract starting proficiencies as readable strings.
 */
export function extractStartingProficiencies(classRaw: Record<string, unknown>): {
  armor: string;
  weapons: string;
  skills: string;
} {
  const sp = classRaw['startingProficiencies'] as Record<string, unknown> | undefined;
  if (!sp) return { armor: '', weapons: '', skills: '' };

  const armor = Array.isArray(sp['armor'])
    ? (sp['armor'] as (string | { proficiency: string })[])
        .map((a) => (typeof a === 'string' ? a : a.proficiency))
        .filter(Boolean)
        .join(', ')
    : '';

  const weapons = Array.isArray(sp['weapons'])
    ? (sp['weapons'] as (string | { proficiency: string })[])
        .map((w) => (typeof w === 'string' ? w : w.proficiency))
        .filter(Boolean)
        .join(', ')
    : '';

  let skills = '';
  if (Array.isArray(sp['skills'])) {
    for (const entry of sp['skills'] as unknown[]) {
      const e = entry as { choose?: { from: string[]; count: number } };
      if (e.choose) {
        skills = `Choose ${e.choose.count} from ${e.choose.from.join(', ')}`;
      }
    }
  }

  return { armor, weapons, skills };
}

/**
 * Extract multiclassing requirements as a readable string.
 * Handles both flat `{ str: 13, cha: 13 }` (AND) and
 * `{ or: [{ str: 13, dex: 13 }] }` (OR) formats.
 */
export function extractMulticlassingReqs(classRaw: Record<string, unknown>): string | null {
  const mc = classRaw['multiclassing'] as {
    requirements?: Record<string, unknown>;
  } | undefined;
  if (!mc?.requirements) return null;

  const reqs = mc.requirements;

  // OR format: { or: [{ str: 13, dex: 13 }] } means "STR 13 or DEX 13"
  if (Array.isArray(reqs['or'])) {
    const groups = (reqs['or'] as Record<string, number>[]).map((group) =>
      Object.entries(group)
        .map(([ability, score]) => `${ABILITY_ABBR[ability] ?? ability.toUpperCase()} ${score}`)
        .join(' or '),
    );
    return groups.join('; ');
  }

  // Flat format: { str: 13, cha: 13 } means "STR 13 and CHA 13"
  return Object.entries(reqs)
    .filter(([, v]) => typeof v === 'number')
    .map(([ability, score]) => `${ABILITY_ABBR[ability] ?? ability.toUpperCase()} ${score}`)
    .join(', ');
}
