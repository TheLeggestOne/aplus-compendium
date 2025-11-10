const ContentParser = require('./ContentParser');

class SkillsParser extends ContentParser {
  getContentType() {
    return 'skills';
  }

  getArrayKey() {
    return 'skill';
  }
}

module.exports = SkillsParser;
