const ContentParser = require('./ContentParser');

class OptionalFeaturesParser extends ContentParser {
  getContentType() {
    return 'optionalfeatures';
  }

  getArrayKey() {
    return 'optionalfeature';
  }
}

module.exports = OptionalFeaturesParser;
