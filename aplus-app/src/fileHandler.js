const fs = require('fs').promises;
const path = require('path');
const { app } = require('electron');

/**
 * FileHandler - Low-level file operations for the compendium
 * Handles JSON serialization/deserialization and file paths
 */
class FileHandler {
  constructor() {
    // Base data directory in user's app data folder
    this.dataDir = path.join(app.getPath('userData'), 'data');
    
    // Directory structure
    this.dirs = {
      content: path.join(this.dataDir, 'content'),
      characters: path.join(this.dataDir, 'characters')
    };
    
    // Content types we support
    this.contentTypes = [
      'actions',
      'backgrounds',
      'classes',
      'conditions',
      'decks',
      'deities',
      'feats',
      'items',
      'languages',
      'monsters',
      'objects',
      'optionalfeatures',
      'races',
      'rules',
      'senses',
      'skills',
      'spells',
      'traps'
    ];
  }
  
  /**
   * Initialize directory structure
   */
  async initialize() {
    try {
      // Create all directories if they don't exist
      for (const dir of Object.values(this.dirs)) {
        await fs.mkdir(dir, { recursive: true });
      }
      
      // Initialize empty content files if they don't exist
      for (const type of this.contentTypes) {
        const filePath = this.getContentPath(type);
        if (!(await this.exists(filePath))) {
          await this.writeJSON(filePath, {});
        }
      }
      
      console.log('FileHandler initialized:', this.dataDir);
    } catch (error) {
      console.error('Failed to initialize FileHandler:', error);
      throw error;
    }
  }
  
  /**
   * Get path for a content type file
   */
  getContentPath(type) {
    if (!this.contentTypes.includes(type)) {
      throw new Error(`Invalid content type: ${type}. Must be one of: ${this.contentTypes.join(', ')}`);
    }
    return path.join(this.dirs.content, `${type}.json`);
  }
  
  /**
   * Get path for a character file
   */
  getCharacterPath(characterId) {
    return path.join(this.dirs.characters, `${characterId}.json`);
  }
  
  /**
   * Read JSON file
   */
  async readJSON(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null; // File doesn't exist
      }
      throw error;
    }
  }
  
  /**
   * Write JSON file
   */
  async writeJSON(filePath, data) {
    try {
      const json = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, json, 'utf-8');
    } catch (error) {
      console.error('Failed to write JSON:', filePath, error);
      throw error;
    }
  }
  
  /**
   * Check if file exists
   */
  async exists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * List all character files
   */
  async listCharacters() {
    try {
      const files = await fs.readdir(this.dirs.characters);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
    } catch (error) {
      console.error('Failed to list characters:', error);
      return [];
    }
  }
  
  /**
   * Delete a file
   */
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return; // Already deleted
      }
      throw error;
    }
  }
  
  /**
   * Read a character file
   */
  async readCharacter(characterId) {
    const filePath = this.getCharacterPath(characterId);
    return await this.readJSON(filePath);
  }
  
  /**
   * Write a character file
   */
  async writeCharacter(characterId, data) {
    const filePath = this.getCharacterPath(characterId);
    const characterData = { ...data, id: characterId };
    await this.writeJSON(filePath, characterData);
  }
  
  /**
   * Delete a character file
   */
  async deleteCharacter(characterId) {
    const filePath = this.getCharacterPath(characterId);
    await this.deleteFile(filePath);
  }
}

// Singleton instance
const fileHandler = new FileHandler();

module.exports = fileHandler;
