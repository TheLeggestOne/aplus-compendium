const ContentParser = require('./ContentParser');

class BackgroundsParser extends ContentParser {
  getContentType() {
    return 'backgrounds';
  }

  getArrayKey() {
    return 'background';
  }
}

module.exports = BackgroundsParser;
