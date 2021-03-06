const _ = require('lodash');
const { LINK_BODY_PROFILE } = require('./const');

class Query {
  constructor(collection, body) {
    this._collection = collection;
    this._body = body;

    this._isFetchOne = false; // 获取单个，返回对象而不是数组
    this._prepareProjection = null; // 需要提取的关联主键字段
    this._needLinksName = null; // 需要提取的关联主键字段
    this._result = [];
  }

  fetchOne() {
    this._isFetchOne = true;
    return this.fetch();
  }

  async fetch() {
    // 连接准备
    if (this._collection._$$proxy) {
      this._prepareQuery();
    }

    if (!!this._collection.schema) {
      this._result = await this._originFindForMongoose();
    } else {
      this._result = await this._originFindForMongodb();
    }
    // 连接查询
    if (this._collection._$$proxy) {
      await this._link();
    }

    if (this._isFetchOne) {
      return this._result[0];
    }

    return this._result;
  }

  _prepareQuery() {
    const needLinksName = _.intersection(this._collection._linkersNames, Object.keys(this._body));
    if (!needLinksName.length) return;

    this._needLinksName = needLinksName;
    // NOTE 无法判断是 localField 还是 foreignField
    // 1、采用配置字段判断，增加复杂度
    // 2、采用更简单的方法，损耗小部分性能全部提取（✔）
    this._prepareProjection = [];
    needLinksName.forEach(v => {
      const linker = this._collection._linkers.get(v);
      this._prepareProjection.push(linker.localField);
      this._prepareProjection.push(linker.foreignField);
    });
  }

  _link() {
    if (!this._result.length) return;
    if (!this._needLinksName) return;

    const promises = [];
    this._needLinksName.forEach((linkName) => {
      const linker = this._collection._linkers.get(linkName);
      switch (linker.type) {
        case 'one':
          promises.push(this._linkOneQuery(linkName, linker));
          break;
        case 'many':
          promises.push(this._linkManyQuery(linkName, linker));
          break;
        default:
      }
    });

    return Promise.all(promises);
  }

  _linkManyQuery(linkName, linker) {
    const query = { [linker.foreignField]: { $in: this._result.map(v => _.get(v, linker.localField)) } };
    const linkBody = this._getLinkBody(linkName, query);

    return new Query(linker.targetCollection, linkBody).fetch().then((result) => {
      const map = new Map();

      result.forEach(v => {

        const key = _.get(v, linker.foreignField).toString();
        if (map.has(key)) {
          map.get(key).push(v);
        } else {
          map.set(key, [v]);
        }
      });

      this._result.forEach((item) => {
        item[linkName] = map.get(_.get(item, linker.localField, '').toString()) || [];
      });
    });
  }

  _linkOneQuery(linkName, linker) {
    const query = { [linker.foreignField]: { $in: this._result.map(v => _.get(v, linker.localField)) } };
    const linkBody = this._getLinkBody(linkName, query);

    return new Query(linker.targetCollection, linkBody).fetch().then((result) => {
      const map = new Map();

      result.forEach(v => map.set(_.get(v, linker.foreignField).toString(), v));

      this._result.forEach((item) => {
        item[linkName] = map.get(_.get(item, linker.localField, '').toString());
      });
    });
  }

  _getLinkBody(linkName, query) {
    const linkBody = _.cloneDeep(this._body[linkName]);

    if (!_.isObject(linkBody)) {
      throw new Error(`${ linkName } is a link name, you should provide a linkQuery object, but get ${ linkBody }`);
    }

    if (!_.get(linkBody, '$filters.$and')) {
      _.set(linkBody, '$filters.$and', []);
    }
    linkBody.$filters.$and.push(query);

    // NOTE 无法判断是 localField 还是 foreignField
    // 1、采用配置字段判断，增加复杂度
    // 2、采用更简单的方法，损耗小部分性能全部提取（✔）
    this._prepareProjection.forEach(v => linkBody[v] = 1);

    return linkBody;
  }

  _originFindForMongoose() {
    let query = {};
    let options = {};
    let projection;
    const body = this._body;

    if (_.isObject(body['$filters'])) {
      query = _.cloneDeep(body['$filters']);
    }

    if (_.isObject(body['$options']) && !_.isEmpty(body['$options'])) {
      options = _.cloneDeep(body['$options']);
    }

    if (this._isFetchOne) {
      _.set(options, 'limit', 1);
    }

    projection = Object.keys(body).filter(v => !LINK_BODY_PROFILE.includes(v));

    if (this._prepareProjection) {
      projection = projection.concat(this._prepareProjection);
    }

    return this._collection.find(query, projection.join(' '), options).lean();
  }

  _originFindForMongodb() {
    let query = {};
    let options = {};
    const body = this._body;

    if (_.isObject(body['$filters'])) {
      query = _.cloneDeep(body['$filters']);
    }

    if (_.isObject(body['$options']) && !_.isEmpty(body['$options'])) {
      options = _.cloneDeep(body['$options']);
    }

    if (this._isFetchOne) {
      _.set(options, 'limit', 1);
    }

    options.projection = Object.keys(body).filter(v => !LINK_BODY_PROFILE.includes(v));

    if (this._prepareProjection) {
      options.projection = options.projection.concat(this._prepareProjection);
    }

    return this._collection.find(query, options).toArray();
  }
}

module.exports = Query;
