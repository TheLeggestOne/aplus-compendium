const ContentParser = require('./ContentParser');

class LanguagesParser extends ContentParser {
  getContentType() {
    return 'languages';
  }

  getArrayKey() {
    return 'language';
  }
}

module.exports = LanguagesParser;
