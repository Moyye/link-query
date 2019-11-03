const _ = require('lodash');
const { PREFIX_LINKS } = require('./constants');

module.exports = class Query {
  constructor(collection, body) {
    this.collection = collection;
    this.body = body;
  }

  async fetch() {
    this._prepareQuery();
    await this._main();
    await this._link();

    return this.result;
  }

  async _main() {
    const [query, options] = this._getQueryAndOptions(this.body);
    if (this._prepareProjection) {
      options.projection = options.projection.concat(this._prepareProjection);
    }

    this.result = await this.collection.find(query, options).fetch();
  }

  _link() {
    if (!this.result.length) {
      return
    }

    const linksName = this._getLinksName();
    const needLinksName = _.intersection(linksName, Object.keys(this.body));
    if (needLinksName.length) {
      const promises = [];
      needLinksName.forEach((linkName) => {
        const config = this.collection[PREFIX_LINKS][linkName];
        if (config.type === 'one') {
          const query = { _id: { $in: _.union(this.result.map(v => v[config.field])) } };
          const linkBody = _.cloneDeep(this.body[linkName]);
          linkBody.$filters = linkBody.$filters || {};
          linkBody.$filters.$and = linkBody.$filters.$and || [];
          linkBody.$filters.$and.push(query);

          promises.push(new Query(config.collection, linkBody).fetch().then((result) => {
            const map = new Map();
            result.forEach(v => map.set(v._id.toString(), v));

            this.result.forEach((item) => {
              item[linkName] = map.get((item[config.field] || '').toString())
            });
          }))
        }
      });

      return Promise.all(promises)
    }
  }

  _prepareQuery() {
    this._prepareProjection = null;
    if (this.collection[PREFIX_LINKS]) {
      this._prepareProjection = Object.values(this.collection[PREFIX_LINKS]).map(v => v.field)
    }
  }

  _getQueryAndOptions(body) {
    let query = {};
    let options = {};

    if (_.isObject(body['$filters'])) {
      query = _.cloneDeep(body['$filters'])
    }

    if (_.isObject(body['$options']) && !_.isEmpty(body['$options'])) {
      options = _.cloneDeep(body['$options'])
    }

    options.projection = Object.keys(body).filter(v => !v.startsWith('$'));

    return [query, options];
  }

  _getLinksName() {
    if (_.isEmpty(this.collection[PREFIX_LINKS])) {
      return []
    }

    return Object.keys(this.collection[PREFIX_LINKS])
  }

  _genarateOneQuery(field) {
    return {
      _id: { $in: this.result.map(v => v[field]).filter(v => v) }
    }
  }
};