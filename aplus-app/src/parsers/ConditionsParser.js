const ContentParser = require('./ContentParser');

class ConditionsParser extends ContentParser {
  getContentType() {
    return 'conditions';
  }

  getArrayKey() {
    return 'condition';
  }
}

module.exports = ConditionsParser;
