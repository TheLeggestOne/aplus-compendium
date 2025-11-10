const ContentParser = require('./ContentParser');

class RulesParser extends ContentParser {
  getContentType() {
    return 'rules';
  }

  getArrayKey() {
    return 'rule';
  }
}

module.exports = RulesParser;
