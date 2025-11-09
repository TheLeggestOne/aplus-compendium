const fileHandler = require('./fileHandler');

/**
 * CharacterManager - Handles character CRUD operations
 * Wraps FileHandler with character-specific logic
 */
class CharacterManager {
  /**
   * Get all characters with their full data
   * @returns {Array} Array of character objects
   */
  async getAll() {
    const ids = await fileHandler.listCharacters();
    const characters = [];
    
    for (const id of ids) {
      const character = await fileHandler.readCharacter(id);
      if (character) {
        characters.push(character);
      }
    }
    
    return characters;
  }

  /**
   * Get a single character by ID
   * @param {string} characterId - The character ID
   * @returns {Object|null} The character data or null if not found
   */
  async get(characterId) {
    return await fileHandler.readCharacter(characterId);
  }

  /**
   * Create or update a character
   * @param {string} characterId - The character ID
   * @param {Object} data - The character data
   */
  async save(characterId, data) {
    await fileHandler.writeCharacter(characterId, data);
  }

  /**
   * Delete a character
   * @param {string} characterId - The character ID
   */
  async delete(characterId) {
    await fileHandler.deleteCharacter(characterId);
  }

  /**
   * Duplicate a character with a new ID
   * @param {string} sourceId - The ID of the character to duplicate
   * @param {string} newId - The ID for the duplicate
   * @returns {Object} The duplicated character data
   */
  async duplicate(sourceId, newId) {
    const sourceCharacter = await this.get(sourceId);
    
    if (!sourceCharacter) {
      throw new Error(`Character ${sourceId} not found`);
    }

    // Create a copy with the new ID
    const duplicate = { ...sourceCharacter, id: newId };
    await this.save(newId, duplicate);
    
    return duplicate;
  }

  /**
   * Check if a character exists
   * @param {string} characterId - The character ID
   * @returns {boolean} True if the character exists
   */
  async exists(characterId) {
    const filePath = fileHandler.getCharacterPath(characterId);
    return await fileHandler.exists(filePath);
  }
}

// Singleton instance
const characterManager = new CharacterManager();

module.exports = characterManager;
