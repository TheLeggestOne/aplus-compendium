const ContentParser = require('./ContentParser');

class RulesParser extends ContentParser {
  getContentType() {
    return 'rules';
  }

  getArrayKey() {
    return 'variantrule';
  }
}

module.exports = RulesParser;
