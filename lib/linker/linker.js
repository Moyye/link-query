const BaseClass = require('../baseUtils/baseClass.js');


class Linker extends BaseClass {
  constructor(name, config) {
    super();
    this.name = name;
    // TODO: add check
    this.config = config;
    this.targetCollection = config.collection;
    this.type = config.type;
    this.field = config.field;
    this.index = config.index;

    this._init();
    this._createIndex();
  }

  _init() {
    let name = this.name;

    if (!_.isString(name)) {
      throw new Error(`links name must be a string, but get a ${ name }`);
    }
    if (name.startsWith('$')) {
      throw new Error(`links name not support start with $, but get a ${ name }`);
    }

    if (!_.isObject(this.config)) {
      throw new Error(`links config must be a object, but get a ${ this.config }`);
    }

    const type = this.config.type || 'one';
    if (!['one', 'many', 'meta'].includes(type)) {
      throw new Error(`link config type only support [one, many, meta], but get a ${ type }`);
    }

    if (!_.isString(this.config.field)) {
      throw new Error(`link config field must be a string, but get a ${ this.config.field }`);
    }

    this._checkIsCollections(this.config.collection);

  }

  // TODO: add test for create index
  _createIndex() {
    if (this.config.index || this.config.unique) {
      const options = {};
      if (this.config.unique) {
        options.unique = true;
      }
      if (this.config.sparse) {
        options.sparse = true;
      }

      this.targetCollection.createIndex({
        [this.field]: 1,
      }, options);
    }
  }

  _checkIsCollections(collection) {
    if (!_.isObject(collection)) {
      throw new Error(`in field ${ name }, you did not provide a collection`);
    }

    ['find', 'insert', 'remove', 'update'].forEach((fc) => {
      if (!_.isFunction(collection[fc])) {
        throw new Error(`in field ${ name }, you did not provide a collection`);
      }
    });
  }
}

module.exports = Linker;