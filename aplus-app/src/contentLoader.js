const fs = require('fs').promises;
const path = require('path');
const contentManager = require('./contentManager');
const parserRegistry = require('./parsers/ParserRegistry');

/**
 * ContentLoader - Loads 5etools format content files
 * Used for bundled SRD and user imports
 */
class ContentLoader {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize the parser registry
   */
  async initialize() {
    if (!this.initialized) {
      await parserRegistry.discoverParsers();
      this.initialized = true;
    }
  }

  /**
   * Get path to bundled resources
   */
  getResourcesPath() {
    // In development, resources are in the project
    // In production, they'll be in the app's resources directory
    if (process.env.NODE_ENV === 'production') {
      return path.join(process.resourcesPath, 'srd');
    } else {
      return path.join(__dirname, '..', 'resources', 'srd');
    }
  }

  /**
   * Load a single 5etools format file
   * @param {string} filePath - Path to the 5etools JSON file
   * @param {string} contentType - The content type to load
   * @param {string} source - Source name for items without a source field
   * @returns {number} Number of items imported
   */
  async loadFile(filePath, contentType, source = 'CUSTOM') {
    await this.initialize();

    const parser = parserRegistry.getParser(contentType);
    if (!parser) {
      throw new Error(`No parser found for content type: ${contentType}`);
    }

    // Read and parse file
    const data = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(data);

    // Parse items (without SRD filtering)
    const items = parser.parse(parsed, { srdOnly: false });

    if (items.length > 0) {
      // Import using contentManager
      await contentManager.import(contentType, items, source);
    }

    return items.length;
  }

  /**
   * Load all bundled SRD content
   */
  async loadBundledSrd() {
    await this.initialize();

    const resourcesPath = this.getResourcesPath();
    console.log('Loading bundled SRD from:', resourcesPath);

    let totalImported = 0;

    for (const contentType of parserRegistry.getContentTypes()) {
      const filePath = path.join(resourcesPath, `${contentType}.json`);

      try {
        // Check if file exists
        await fs.access(filePath);

        const count = await this.loadFile(filePath, contentType, 'SRD');
        
        if (count > 0) {
          console.log(`  ✓ Loaded ${count} ${contentType}`);
          totalImported += count;
        }
      } catch (error) {
        if (error.code === 'ENOENT') {
          // File doesn't exist - skip it (not all content types may have bundled data)
          console.log(`  - No bundled data for ${contentType}`);
        } else {
          console.error(`  ✗ Failed to load ${contentType}:`, error.message);
        }
      }
    }

    console.log(`SRD loading complete: ${totalImported} total items`);
    return totalImported;
  }

  /**
   * Load content from a directory of 5etools format files
   * @param {string} dirPath - Directory containing 5etools JSON files
   * @param {string} source - Source name for imported content
   */
  async loadDirectory(dirPath, source = 'CUSTOM') {
    await this.initialize();

    const files = await fs.readdir(dirPath);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    let totalImported = 0;

    for (const filename of jsonFiles) {
      const filePath = path.join(dirPath, filename);

      try {
        const data = await fs.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(data);

        // Check each parser to see if this file has content for it
        for (const contentType of parserRegistry.getContentTypes()) {
          const parser = parserRegistry.getParser(contentType);
          const arrayKey = parser.getArrayKey();

          if (parsed[arrayKey] && Array.isArray(parsed[arrayKey]) && parsed[arrayKey].length > 0) {
            const items = parser.parse(parsed, { srdOnly: false });

            if (items.length > 0) {
              await contentManager.import(contentType, items, source);
              totalImported += items.length;
            }
          }
        }
      } catch (error) {
        console.error(`  ✗ Failed to load ${filename}:`, error.message);
      }
    }

    return totalImported;
  }
}

const contentLoader = new ContentLoader();

module.exports = contentLoader;
