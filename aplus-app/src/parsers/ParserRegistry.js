const fs = require('fs').promises;
const path = require('path');

/**
 * ParserRegistry - Discovers and manages content parsers
 */
class ParserRegistry {
  constructor() {
    this.parsers = new Map();
  }

  /**
   * Discover and register all parsers in the parsers directory
   */
  async discoverParsers() {
    const parsersDir = __dirname;
    const files = await fs.readdir(parsersDir);

    for (const file of files) {
      // Skip base class and registry itself
      if (file === 'ContentParser.js' || file === 'ParserRegistry.js') {
        continue;
      }

      if (file.endsWith('Parser.js')) {
        const ParserClass = require(path.join(parsersDir, file));
        const parser = new ParserClass();
        const contentType = parser.getContentType();
        
        this.parsers.set(contentType, parser);
        console.log(`  Registered parser: ${contentType} (${file})`);
      }
    }

    console.log(`Parser discovery complete: ${this.parsers.size} parsers registered`);
  }

  /**
   * Get parser for a content type
   */
  getParser(contentType) {
    return this.parsers.get(contentType);
  }

  /**
   * Get all registered content types
   */
  getContentTypes() {
    return Array.from(this.parsers.keys());
  }

  /**
   * Check if a parser exists for a content type
   */
  hasParser(contentType) {
    return this.parsers.has(contentType);
  }
}

// Singleton instance
const registry = new ParserRegistry();

module.exports = registry;
