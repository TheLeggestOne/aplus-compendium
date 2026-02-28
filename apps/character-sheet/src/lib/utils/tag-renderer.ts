/**
 * 5etools tag renderer
 *
 * Converts 5etools inline {@tag content} notation and entry structures
 * to sanitised HTML strings suitable for {@html} in Svelte components.
 *
 * Tags follow the pattern: {@tagName part1|part2|part3}
 * where part3 is the optional display override, part1 is the primary value,
 * and part2 is usually a source code.
 */

// ---------------------------------------------------------------------------
// Inline tag rendering
// ---------------------------------------------------------------------------

const TAG_RE = /\{@(\w+)(?:\s([^}]*))?\}/g;

export function renderInline(text: string): string {
  return text.replace(TAG_RE, (_match, tag: string, content: string = '') => {
    return renderTag(tag, content.trim());
  });
}

function renderTag(tag: string, content: string): string {
  const parts = content.split('|');
  const main    = parts[0] ?? '';
  const _source = parts[1] ?? '';
  // 3rd pipe segment is the explicit display override
  const display = parts[2] ?? parts[0] ?? '';

  switch (tag) {
    // --- Dice & numbers ---
    case 'damage':
    case 'scaledamage':
      return `<span class="font-semibold text-red-400">${main.split(';')[0]}</span>`;

    case 'dice':
    case 'scaledice':
      return `<span class="font-semibold text-orange-300">${main.split(';')[0]}</span>`;

    case 'd20':
      return `<span class="font-semibold text-orange-300">d20${main ? ` (${main})` : ''}</span>`;

    case 'hit':
      return `<span class="font-semibold">+${main}</span>`;

    case 'dc':
      return `<span class="font-semibold">DC ${main}</span>`;

    case 'chance':
      return `${main}%`;

    case 'recharge':
      return `<span class="text-muted-foreground">(Recharge ${main === '6' ? '6' : `${main}–6`})</span>`;

    // --- Attack notation ---
    case 'atk':
      return renderAttack(main);

    case 'h':
      return '<em class="font-medium">Hit:</em> ';

    case 'miss':
      return '<em class="font-medium">Miss:</em> ';

    // --- Conditions / status ---
    case 'condition':
    case 'disease':
    case 'status':
      return `<span class="italic text-yellow-300">${capitalize(main)}</span>`;

    // --- Named references (spells, items, creatures, etc.) ---
    // These are rendered as accented spans — phase 4 will make them clickable
    case 'spell':
    case 'item':
    case 'creature':
    case 'race':
    case 'class':
    case 'subclass':
    case 'feat':
    case 'background':
    case 'classFeature':
    case 'optfeature':
    case 'language':
    case 'sense':
    case 'skill':
    case 'action':
    case 'itemProperty':
    case 'variantrule':
    case 'quickref':
    case 'table':
    case 'deity':
    case 'hazard':
    case 'area':
    case 'adventure':
    case 'book':
    case 'card':
    case 'deck':
      return `<span class="text-amber-400">${display || capitalize(main)}</span>`;

    case 'filter':
      // {@filter display text|...} — first segment is always display
      return `<span class="text-amber-400">${main}</span>`;

    case 'link':
      // {@link display|url} — external link, render as plain text
      return main;

    // --- Text formatting ---
    case 'b':
    case 'bold':
      return `<strong>${renderInline(content)}</strong>`;

    case 'i':
    case 'italic':
      return `<em>${renderInline(content)}</em>`;

    case 'u':
    case 'underline':
      return `<u>${renderInline(content)}</u>`;

    case 's':
    case 'strike':
      return `<s>${renderInline(content)}</s>`;

    case 'color':
      // {@color text|hex}
      return `<span style="color:#${_source}">${renderInline(main)}</span>`;

    case 'note':
      return `<em class="text-sm text-muted-foreground">${renderInline(content)}</em>`;

    // --- Unknown / future tags ---
    default:
      // Return the display text, falling back to the raw content without braces
      return display || main || content;
  }
}

function renderAttack(code: string): string {
  const parts = code.split(',').map(p => p.trim());
  const labels = parts.map(p => {
    switch (p) {
      case 'mw': return 'Melee Weapon';
      case 'rw': return 'Ranged Weapon';
      case 'ms': return 'Melee Spell';
      case 'rs': return 'Ranged Spell';
      case 'mw,rw': return 'Melee or Ranged Weapon';
      case 'ms,rs': return 'Melee or Ranged Spell';
      default: return p;
    }
  });
  return `<em>${labels.join(' or ')} Attack:</em>`;
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---------------------------------------------------------------------------
// Entry structure rendering
// ---------------------------------------------------------------------------

type Entry = string | EntryObject;

interface EntryObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type?: string;
  name?: string;
  entries?: Entry[];
  items?: Entry[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Renders a 5etools entries array to an HTML string.
 * Handles the most common structural types; unknown types fall back to
 * recursive string rendering.
 */
export function renderEntries(entries: unknown[], depth = 0): string {
  return entries.map(e => renderEntry(e as Entry, depth)).join('\n');
}

function renderEntry(entry: Entry, depth: number): string {
  if (typeof entry === 'string') {
    return `<p>${renderInline(entry)}</p>`;
  }

  if (!entry || typeof entry !== 'object') return '';

  switch (entry.type) {
    case 'entries':
    case 'section': {
      const heading = entry.name
        ? `<h${Math.min(depth + 4, 6)} class="font-semibold mt-3 mb-1">${renderInline(entry.name)}</h${Math.min(depth + 4, 6)}>`
        : '';
      const body = entry.entries ? renderEntries(entry.entries, depth + 1) : '';
      return heading + body;
    }

    case 'list': {
      if (!Array.isArray(entry.items)) return '';
      const itemsHtml = entry.items.map(item => {
        if (typeof item === 'string') {
          return `<li>${renderInline(item)}</li>`;
        }
        // Nested entry object inside a list
        return `<li>${renderEntry(item as Entry, depth + 1)}</li>`;
      }).join('\n');
      const listClass = entry.style === 'list-no-bullets' ? 'list-none' : 'list-disc list-inside';
      return `<ul class="${listClass} space-y-1 my-2">\n${itemsHtml}\n</ul>`;
    }

    case 'table': {
      const caption = entry.caption
        ? `<caption class="text-sm font-semibold mb-1">${renderInline(entry.caption)}</caption>`
        : '';
      const headers = Array.isArray(entry.colLabels)
        ? `<thead><tr>${(entry.colLabels as string[]).map(h =>
            `<th class="text-left px-2 py-1 border-b border-border font-semibold">${renderInline(String(h))}</th>`
          ).join('')}</tr></thead>`
        : '';
      const rows = Array.isArray(entry.rows)
        ? `<tbody>${(entry.rows as unknown[][]).map(row =>
            `<tr class="border-b border-border/30">${row.map(cell =>
              `<td class="px-2 py-1">${renderInline(String(typeof cell === 'object' ? JSON.stringify(cell) : cell))}</td>`
            ).join('')}</tr>`
          ).join('\n')}</tbody>`
        : '';
      return `<div class="overflow-x-auto my-3"><table class="text-sm w-full">${caption}${headers}${rows}</table></div>`;
    }

    case 'inset':
    case 'insetReadaloud': {
      const name = entry.name
        ? `<p class="font-semibold mb-1">${renderInline(entry.name)}</p>`
        : '';
      const body = entry.entries ? renderEntries(entry.entries, depth + 1) : '';
      return `<aside class="border-l-2 border-amber-600/50 pl-3 my-3 text-muted-foreground">${name}${body}</aside>`;
    }

    case 'quote': {
      const body = entry.entries ? renderEntries(entry.entries, depth + 1) : '';
      const by = entry.by
        ? `<footer class="text-sm text-muted-foreground mt-1">— ${renderInline(String(entry.by))}</footer>`
        : '';
      return `<blockquote class="border-l-2 border-border pl-3 my-3 italic">${body}${by}</blockquote>`;
    }

    case 'abilityDc': {
      const name = entry.name ?? '';
      const attrs = (entry.attributes as string[] ?? []).join(', ').toUpperCase();
      return `<p><strong>${name} save DC</strong> = 8 + proficiency bonus + ${attrs} modifier</p>`;
    }

    case 'abilityAttackMod': {
      const name = entry.name ?? '';
      const attrs = (entry.attributes as string[] ?? []).join(', ').toUpperCase();
      return `<p><strong>${name} attack modifier</strong> = proficiency bonus + ${attrs} modifier</p>`;
    }

    case 'item': {
      // Named list item: { type: "item", name: "Foo", entry: "..." } or { ..., entries: [...] }
      const nameHtml = entry.name ? `<strong>${renderInline(entry.name)}.</strong> ` : '';
      if (typeof entry.entry === 'string') {
        return nameHtml + renderInline(entry.entry);
      }
      if (entry.entries) {
        return nameHtml + renderEntries(entry.entries, depth + 1);
      }
      return nameHtml;
    }

    case 'options':
    case 'homebrew': {
      if (entry.entries) return renderEntries(entry.entries, depth);
      if (entry.items) return renderEntries(entry.items as Entry[], depth);
      return '';
    }

    case 'hr':
      return '<hr class="border-border my-3" />';

    case 'image':
      // Skip images — no asset hosting
      return '';

    case 'spellcasting': {
      // Spellcasting stat block section (monsters) — simplified
      const name = entry.name ? `<p class="font-semibold">${renderInline(entry.name)}</p>` : '';
      const body = entry.entries ? renderEntries(entry.entries, depth + 1) : '';
      return name + body;
    }

    default: {
      // Fallback: if it has entries, recurse; otherwise stringify
      if (Array.isArray(entry.entries)) {
        const heading = entry.name
          ? `<p class="font-semibold">${renderInline(entry.name)}</p>`
          : '';
        return heading + renderEntries(entry.entries, depth + 1);
      }
      return '';
    }
  }
}
