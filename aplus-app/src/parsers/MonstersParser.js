const ContentParser = require('./ContentParser');

class MonstersParser extends ContentParser {
  getContentType() {
    return 'monsters';
  }

  getArrayKey() {
    return 'monster';
  }
}

module.exports = MonstersParser;
