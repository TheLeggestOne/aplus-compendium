/**
 * Base parser interface for 5etools content
 * Each content type should extend this
 */
class ContentParser {
  /**
   * @returns {string} The content type (backgrounds, classes, etc.)
   */
  getContentType() {
    throw new Error('getContentType() must be implemented');
  }

  /**
   * @returns {string} The 5etools array key (background, class, etc.)
   */
  getArrayKey() {
    throw new Error('getArrayKey() must be implemented');
  }

  /**
   * Parse and filter items from 5etools format
   * @param {Object} data - The parsed 5etools JSON
   * @param {Object} options - Parsing options (e.g., srdOnly)
   * @returns {Array} Filtered and processed items
   */
  parse(data, options = {}) {
    const arrayKey = this.getArrayKey();
    
    if (!data[arrayKey] || !Array.isArray(data[arrayKey])) {
      return [];
    }

    let items = data[arrayKey];

    // Filter to SRD if requested
    if (options.srdOnly) {
      items = items.filter(item => item.srd === true || item.srd52 === true);
    }

    // Allow subclass to transform items
    return items.map(item => this.transformItem(item));
  }

  /**
   * Transform an individual item (override for custom processing)
   * @param {Object} item - The item to transform
   * @returns {Object} Transformed item
   */
  transformItem(item) {
    return item;
  }
}

module.exports = ContentParser;
