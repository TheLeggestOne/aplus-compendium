const ContentParser = require('./ContentParser');

class SensesParser extends ContentParser {
  getContentType() {
    return 'senses';
  }

  getArrayKey() {
    return 'sense';
  }
}

module.exports = SensesParser;
