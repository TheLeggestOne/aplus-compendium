import { app } from 'electron';
import { mkdir, readFile, writeFile, readdir, unlink } from 'fs/promises';
import { join } from 'path';
import type { Character } from '@aplus-compendium/types';
import { seedCharacter } from './seed-character.js';

function charactersDir(): string {
  return join(app.getPath('userData'), 'characters');
}

function characterPath(id: string): string {
  return join(charactersDir(), `${id}.json`);
}

async function ensureDir(): Promise<void> {
  await mkdir(charactersDir(), { recursive: true });
}

export async function listCharacters(): Promise<Character[]> {
  await ensureDir();
  const files = await readdir(charactersDir());
  const jsonFiles = files.filter((f) => f.endsWith('.json'));
  const results = await Promise.all(
    jsonFiles.map(async (file) => {
      try {
        const raw = await readFile(join(charactersDir(), file), 'utf-8');
        return JSON.parse(raw) as Character;
      } catch {
        return null;
      }
    }),
  );
  return results.filter((c): c is Character => c !== null);
}

export async function getCharacter(id: string): Promise<Character | null> {
  await ensureDir();
  try {
    const raw = await readFile(characterPath(id), 'utf-8');
    return JSON.parse(raw) as Character;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }
}

export async function saveCharacter(character: Character): Promise<void> {
  await ensureDir();
  await writeFile(characterPath(character.id), JSON.stringify(character, null, 2), 'utf-8');
}

export async function deleteCharacter(id: string): Promise<void> {
  await unlink(characterPath(id));
}

export async function seedIfEmpty(): Promise<void> {
  await ensureDir();
  const files = await readdir(charactersDir());
  if (files.filter((f) => f.endsWith('.json')).length === 0) {
    await saveCharacter(seedCharacter);
  }
}
