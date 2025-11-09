const fileHandler = require('./fileHandler');

/**
 * ContentManager - Handles content operations with compound keys
 * Manages import/merge logic and content retrieval
 */
class ContentManager {
  /**
   * Create a compound key from name and source
   * @param {string} name - The item name
   * @param {string} source - The source (e.g., "SRD", "PHB")
   * @returns {string} Compound key in format "name::SOURCE"
   */
  makeKey(name, source) {
    if (!name || !source) {
      throw new Error('Name and source are required for compound key');
    }
    return `${name}::${source.toUpperCase()}`;
  }

  /**
   * Parse a compound key into name and source
   * @param {string} key - Compound key in format "name::SOURCE"
   * @returns {{name: string, source: string}}
   */
  parseKey(key) {
    const parts = key.split('::');
    if (parts.length !== 2) {
      throw new Error(`Invalid compound key format: ${key}`);
    }
    return {
      name: parts[0],
      source: parts[1]
    };
  }

  /**
   * Get all items of a content type
   * @param {string} type - Content type (backgrounds, classes, etc.)
   * @returns {Object} Object with compound keys mapping to item data
   */
  async getAll(type) {
    const filePath = fileHandler.getContentPath(type);
    const data = await fileHandler.readJSON(filePath);
    return data || {};
  }

  /**
   * Import items into a content type with additive-only merging
   * @param {string} type - Content type
   * @param {Array} items - Array of items to import
   * @param {string} source - Source to use for items that don't have one (required)
   */
  async import(type, items, source) {
    if (!Array.isArray(items)) {
      throw new Error('Items must be an array');
    }
    
    if (!source) {
      throw new Error('source is required');
    }

    // Get existing content
    const existing = await this.getAll(type);

    // Process each item
    for (const item of items) {
      const itemSource = item.source || source;
      const name = item.name;

      if (!name) {
        console.warn('Skipping item without name:', item);
        continue;
      }

      const key = this.makeKey(name, itemSource);

      // Check if this exact key exists
      if (existing[key]) {
        // Additive merge - only add fields that don't exist or aren't blank
        const merged = { ...existing[key] };
        
        for (const [field, value] of Object.entries(item)) {
          // Add field if it doesn't exist in current data, or if current value is blank/null/undefined
          if (!(field in merged) || merged[field] === null || merged[field] === undefined || merged[field] === '') {
            if (value !== null && value !== undefined && value !== '') {
              merged[field] = value;
            }
          }
        }
        
        existing[key] = merged;
      } else {
        // New item - add it with source field
        existing[key] = { ...item, source: itemSource };
      }
    }

    // Write back to file
    const filePath = fileHandler.getContentPath(type);
    await fileHandler.writeJSON(filePath, existing);
  }

  /**
   * Search/filter items of a content type
   * @param {string} type - Content type
   * @param {string} query - Search query (searches in name and description)
   * @returns {Object} Filtered items
   */
  async search(type, query) {
    const all = await this.getAll(type);
    
    if (!query || query.trim() === '') {
      return all;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = {};

    for (const [key, item] of Object.entries(all)) {
      const { name } = this.parseKey(key);
      const description = item.description || item.desc || '';
      
      // Search in name and description
      if (name.toLowerCase().includes(lowerQuery) || 
          description.toLowerCase().includes(lowerQuery)) {
        filtered[key] = item;
      }
    }

    return filtered;
  }

  /**
   * Get a single item by name and source
   * @param {string} type - Content type
   * @param {string} name - Item name
   * @param {string} source - Item source
   * @returns {Object|null} The item or null if not found
   */
  async get(type, name, source) {
    const all = await this.getAll(type);
    const key = this.makeKey(name, source);
    return all[key] || null;
  }

  /**
   * Delete an item by name and source
   * @param {string} type - Content type
   * @param {string} name - Item name
   * @param {string} source - Item source
   */
  async delete(type, name, source) {
    const all = await this.getAll(type);
    const key = this.makeKey(name, source);
    
    if (all[key]) {
      delete all[key];
      const filePath = fileHandler.getContentPath(type);
      await fileHandler.writeJSON(filePath, all);
    }
  }
}

// Singleton instance
const contentManager = new ContentManager();

module.exports = contentManager;
