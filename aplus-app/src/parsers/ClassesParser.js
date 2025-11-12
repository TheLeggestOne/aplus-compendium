const ContentParser = require('./ContentParser');

class ClassesParser extends ContentParser {
  getContentType() {
    return 'classes';
  }

  getArrayKey() {
    return 'class';
  }
}

module.exports = ClassesParser;
