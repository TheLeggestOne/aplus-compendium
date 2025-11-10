const ContentParser = require('./ContentParser');

class RacesParser extends ContentParser {
  getContentType() {
    return 'races';
  }

  getArrayKey() {
    return 'race';
  }
}

module.exports = RacesParser;
