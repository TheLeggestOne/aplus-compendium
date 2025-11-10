const ContentParser = require('./ContentParser');

class ActionsParser extends ContentParser {
  getContentType() {
    return 'actions';
  }

  getArrayKey() {
    return 'action';
  }
}

module.exports = ActionsParser;
