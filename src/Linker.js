const { LINK_TYPE } = require('./const');
const _ = require('lodash');

class Linker {
  constructor(name, config) {
    if (!_.isObject(config)) {
      throw new Error(`links config must be a object, but get a ${ config }`);
    }

    this.name = name;
    this.targetCollection = config.collection;
    this.type = config.type;
    this.foreignField = config.foreignField || '_id';
    this.localField = config.localField || '_id';
    this.index = config.index;
    this.unique = config.unique;
    this.sparse = config.sparse;

    this.check();
    this.createIndex();
  }

  check() {
    let name = this.name;

    if (!_.isString(name)) {
      throw new Error(`links name must be a string, but get a ${ name }`);
    }

    const type = this.type || 'one';
    if (!LINK_TYPE.includes(type)) {
      throw new Error(`link config type only support ${ LINK_TYPE.toString() }, but get a ${ type }`);
    }

    if (!_.isString(this.localField)) {
      throw new Error(`link config localField must be a string, but get a ${ this.localField }`);
    }

    if (!_.isString(this.foreignField)) {
      throw new Error(`link config foreignField must be a string, but get a ${ this.foreignField }`);
    }


    this.checkIsCollections(this.targetCollection);
  }

  createIndex() {
    if (this.index || this.unique) {
      const options = {};
      if (this.unique) {
        options.unique = true;
      }
      if (this.sparse) {
        options.sparse = true;
      }

      if (this.foreignField !== '_id') {
        this.targetCollection.createIndex({
          [this.foreignField]: 1,
        }, options);
      }

      if (this.localField !== '_id') {
        this.targetCollection.createIndex({
          [this.localField]: 1,
        }, options);
      }
    }
  }

  checkIsCollections(collection) {
    if (!_.isObject(collection)) {
      throw new Error(`in field ${ this.name }, you did not provide a collection`);
    }

    ['find', 'insert', 'remove', 'update'].forEach((fc) => {
      if (!_.isFunction(collection[fc])) {
        throw new Error(`in field ${ this.name }, you did not provide a collection`);
      }
    });
  }
}

module.exports = Linker;
