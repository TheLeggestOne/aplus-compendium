const ContentParser = require('./ContentParser');

class DecksParser extends ContentParser {
  getContentType() {
    return 'decks';
  }

  getArrayKey() {
    return 'deck';
  }
}

module.exports = DecksParser;
