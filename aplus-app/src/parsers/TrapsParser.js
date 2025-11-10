const ContentParser = require('./ContentParser');

class TrapsParser extends ContentParser {
  getContentType() {
    return 'traps';
  }

  getArrayKey() {
    return 'trap';
  }
}

module.exports = TrapsParser;
