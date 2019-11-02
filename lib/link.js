const _ = require('lodash');
const { PREFIX_LINKS } = require('./constants');


module.exports = class Link {
  constructor(collection, linkField, config) {
    this.primaryCollection = collection;
    this.linkField = linkField;
    this.config = config;

    this._init();
    this._createIndex()
  }


  _init() {
    if (!_.isString(this.linkField)) {
      throw new Error(`links name must be a string, but get a ${ this.linkField }`);
    }
    if (this.linkField.startsWith('$')) {
      throw new Error(`links name not support start with $, but get a ${ this.linkField }`);
    }
    if (this.primaryCollection[PREFIX_LINKS][this.linkField]) {
      throw new Error(`${ this.linkField } has been defined elsewhere`);
    }

    if (!_.isObject(this.config)) {
      throw new Error(`links config must be a object, but get a ${ this.config }`);
    }

    const type = this.config.type || 'one';
    if (!['one', 'many'].includes(type)) {
      throw new Error(`link config type only support [one, many], but get a ${ type }`);
    }

    if (!_.isString(this.config.field)) {
      throw new Error(`link config field must be a string, but get a ${ this.config.field }`);
    }

    let linkCollection = this.config.collection;
    if (_.isString(linkCollection)) {
      linkCollection = this._getCurrentConnectionCollectionByName(this.config.collection)
    }
    this._checkIsCollections(linkCollection);

    this.primaryCollection[PREFIX_LINKS][this.linkField] = {
      type,
      collection: linkCollection,
      field: this.config.field
    }
  }

  _createIndex() {
    if (this.config.index || this.config.unique) {
      const options = {};
      if (this.config.unique) {
        options.unique = true;
      }
      if (this.config.sparse) {
        options.sparse = true;
      }

      this.primaryCollection.createIndex({ [this.config.field]: 1 }, options)
    }
  }

  _checkIsCollections(collection) {
    if (!_.isObject(collection)) {
      throw new Error(`in field ${ this.linkField }, you did not provide a collection`)
    }

    ['find', 'insert', 'remove', 'update'].forEach((fc) => {
      if (!_.isFunction(collection[fc])) {
        throw new Error(`in field ${ this.linkField }, you did not provide a collection`)
      }
    })
  }

  _getCurrentConnectionCollectionByName(collectionName) {
    // try get primary collection db for link
    const db = _.get(this.primaryCollection, 's.db');
    if (!db) {
      throw new Error(`in field ${ this.linkField }, sorry we can't get origin db connection, plz provide collection instead of collection name`)
    }
    return db.collection(collectionName);
  }
};