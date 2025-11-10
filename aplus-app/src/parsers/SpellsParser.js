const ContentParser = require('./ContentParser');

class SpellsParser extends ContentParser {
  getContentType() {
    return 'spells';
  }

  getArrayKey() {
    return 'spell';
  }
}

module.exports = SpellsParser;
