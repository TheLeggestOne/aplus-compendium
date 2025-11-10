const ContentParser = require('./ContentParser');

class ClassesParser extends ContentParser {
  getContentType() {
    return 'classes';
  }

  getArrayKey() {
    return 'class';
  }

  /**
   * Override parse to handle splitting classes and subclasses
   */
  parse(data, options = {}) {
    const arrayKey = this.getArrayKey();
    
    if (!data[arrayKey] || !Array.isArray(data[arrayKey])) {
      return [];
    }

    let items = data[arrayKey];

    // Filter to SRD if requested
    if (options.srdOnly) {
      items = items.filter(item => item.srd === true || item.srd52 === true);
    }

    const result = [];

    for (const classItem of items) {
      // Add the base class (without subclasses array to avoid duplication)
      const baseClass = { ...classItem };
      delete baseClass.subclasses;
      result.push(this.transformItem(baseClass));

      // Extract subclasses as separate items
      if (classItem.subclasses && Array.isArray(classItem.subclasses)) {
        for (const subclass of classItem.subclasses) {
          // Filter subclass by SRD if needed
          if (options.srdOnly && !(subclass.srd === true || subclass.srd52 === true)) {
            continue;
          }

          // Add reference to parent class
          const subclassItem = {
            ...subclass,
            className: classItem.name,
            classSource: classItem.source
          };
          
          result.push(this.transformItem(subclassItem));
        }
      }
    }

    return result;
  }
}

module.exports = ClassesParser;
