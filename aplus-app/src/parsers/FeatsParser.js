const ContentParser = require('./ContentParser');

class FeatsParser extends ContentParser {
  getContentType() {
    return 'feats';
  }

  getArrayKey() {
    return 'feat';
  }
}

module.exports = FeatsParser;
