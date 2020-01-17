const _ = require('lodash');
const Linker = require('./Linker');
const Query = require('./Query');
const { LINK_QUERY_PROFILE } = require('./const');

class QueryBase extends Function {
  constructor(collection, linkConfig = {}) {
    super();
    this._delegate = collection;

    // 存储需要关联的配置
    this._linkers = new Map();
    // 缓存虚拟字段
    this._linkersNames = [];
    // 代理对象引用
    this._$$proxy = null;

    this.addLinker(linkConfig);
  }

  addLinker(linkConfig) {
    if (!_.isObject(linkConfig)) {
      throw new Error(`${ linkConfig } must be a object`);
    }

    for (const [name, config] of Object.entries(linkConfig)) {
      if (this._linkers.has(name)) {
        throw new Error(`${ name } has been defined elsewhere`);
      }

      const linker = new Linker(name, config);
      this._linkers.set(name, linker);
      this._linkersNames.push(name);

      // 处理 inverse
      if (config.inverse) {
        if (!config.collection._$$proxy) {
          throw new Error(`${ name } inverse fail, because collection hasn't been decorated yet`);
        }

        for (const inverseConfig of Object.values(config.inverse)) {
          inverseConfig.foreignField = config.localField;
          inverseConfig.localField = config.foreignField;
          inverseConfig.collection = this._$$proxy;
        }

        config.collection._$$proxy.addLinker(config.inverse);
      }
    }
  }

  linkQuery(query, options = {}) {
    return new Query(this, query, options);
  }

  origin(method) {
    return this._delegate[method];
  }
}

function decorator(collection, config) {
  const queryBase = new QueryBase(collection, config);
  const $$proxy = new Proxy(queryBase, {
    construct(target, args) {
      return new target._delegate(...args);
    },
    get(target, p) {
      if (LINK_QUERY_PROFILE.includes(p)) {
        return target[p];
      }
      return target.origin(p);
    },
  });
  queryBase._$$proxy = $$proxy;

  return $$proxy;
}

module.exports = {
  decorator,
};
