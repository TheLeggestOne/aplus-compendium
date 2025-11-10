const ContentParser = require('./ContentParser');

class ObjectsParser extends ContentParser {
  getContentType() {
    return 'objects';
  }

  getArrayKey() {
    return 'object';
  }
}

module.exports = ObjectsParser;
