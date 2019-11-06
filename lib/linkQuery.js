const _ = require('lodash');
const { PREFIX_LINKS } = require('./constants');

module.exports = class Query {
  constructor(collection, body) {
    this.collection = collection;
    this.body = body;

    this._needLinksName = []; // 需要关联表的字段
    this._prepareProjection = null; // 需要提取的关联主键字段
    this._isFetcchOne = false;
    this.result = [];
  }

  fetchOne() {
    this._isFetcchOne = true;
    return this.fetch()
  }

  fetchAll() {
    return this.fetch()
  }

  async fetch() {
    this._prepareQuery();
    await this._main();
    await this._link();

    if (this._isFetcchOne) {
      return _.first(this.result);
    }
    return this.result;
  }

  count() {
    const [query] = this._getQueryAndOptions(this.body);
    return this.collection.find(query).count();
  }

  async _main() {
    const [query, options] = this._getQueryAndOptions(this.body);
    if (this._prepareProjection) {
      options.projection = options.projection.concat(this._prepareProjection);
    }

    if (this._isFetcchOne) {
      _.set(options, 'limit', 1)
    }

    this.result = await this.collection.find(query, options).fetch();
  }

  // 需要Link前的检查，判断需要连接的表，提取字段
  _prepareQuery() {
    const linksName = this._getLinksName();
    this._needLinksName = _.intersection(linksName, Object.keys(this.body));
    if (this._needLinksName.length) {
      this._prepareProjection = this._needLinksName.map(v => this.collection[PREFIX_LINKS][v].field);
    }
  }

  _link() {
    if (!this.result.length) {
      return
    }

    if (this._needLinksName.length) {
      const promises = [];
      this._needLinksName.forEach((linkName) => {
        const config = this.collection[PREFIX_LINKS][linkName];
        switch (config.type) {
          case 'one':
            promises.push(this._linkOneQuery(config, linkName));
            break;
          case 'many':
            promises.push(this._linkManyQuery(config, linkName));
            break;
          case 'meta':
            promises.push(this._linkMetaQuery(config, linkName));
            break;
          default:
        }
      });

      return Promise.all(promises)
    }
  }

  _linkManyQuery(config, linkName) {
    const query = { _id: { $in: _.flatten(this.result.map(v => v[config.field])) } };
    const linkBody = this._getLinkBody(linkName, query);

    return new Query(config.collection, linkBody).fetch().then((result) => {
      const map = new Map();
      result.forEach(v => map.set(v._id.toString(), v));

      this.result.forEach((item) => {
        if (_.isArray(item[config.field])) {
          item[linkName] = item[config.field].map(v => map.get((v || '').toString())).filter(v => v)
        } else {
          item[linkName] = []
        }
      });
    })
  }

  // TODO
  _linkMetaQuery(config, linkName) {

  }

  _linkOneQuery(config, linkName) {
    const query = { _id: { $in: this.result.map(v => v[config.field]) } };
    const linkBody = this._getLinkBody(linkName, query);

    return new Query(config.collection, linkBody).fetch().then((result) => {
      const map = new Map();
      result.forEach(v => map.set(v._id.toString(), v));

      this.result.forEach((item) => {
        item[linkName] = map.get((item[config.field] || '').toString())
      });
    })
  }

  _getLinkBody(linkName, query) {
    const linkBody = _.cloneDeep(this.body[linkName]);

    if (!_.isObject(linkBody)) {
      throw new Error(`${ linkName } is a link name, you should provide a linkQuery object, but get ${ linkBody }`)
    }

    if (!_.get(linkBody, '$filters.$and')) {
      _.set(linkBody, '$filters.$and', [])
    }
    linkBody.$filters.$and.push(query);

    return linkBody;
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
};