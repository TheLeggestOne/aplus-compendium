const ContentParser = require('./ContentParser');

class DeitiesParser extends ContentParser {
  getContentType() {
    return 'deities';
  }

  getArrayKey() {
    return 'deity';
  }
}

module.exports = DeitiesParser;
