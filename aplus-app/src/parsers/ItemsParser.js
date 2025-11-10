const ContentParser = require('./ContentParser');

class ItemsParser extends ContentParser {
  getContentType() {
    return 'items';
  }

  getArrayKey() {
    return 'item';
  }
}

module.exports = ItemsParser;
