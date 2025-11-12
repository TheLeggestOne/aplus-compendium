const ContentParser = require('./ContentParser');

class SubclassesParser extends ContentParser {
  getContentType() {
    return 'subclasses';
  }

  getArrayKey() {
    return 'subclass';
  }
}

module.exports = SubclassesParser;
