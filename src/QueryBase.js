const _ = require('lodash');
const Linker = require('./Linker');
const Query = require('./Query');
const { LINK_QUERY_PROFILE } = require('./const');

class QueryBase {
  constructor(collection, linkConfig = {}) {
    this.delegate = collection;
    this.isLinkQueryDelegate = true;

    // 存储需要关联的配置
    this.linkers = new Map();
    // 缓存虚拟字段
    this.linkersNames = [];

    this.addLinker(linkConfig);
  }

  addLinker(linkConfig) {
    if (!_.isObject(linkConfig)) {
      throw new Error(`${ linkConfig } must be a object`);
    }

    for (const [name, config] of Object.entries(linkConfig)) {
      if (this.linkers.has(name)) {
        throw new Error(`${ name } has been defined elsewhere`);
      }

      const linker = new Linker(name, config);
      this.linkers.set(name, linker);
      this.linkersNames.push(name);
    }
  }

  linkQuery(query, options = {}) {
    return new Query(this, query, options);
  }

  origin(method) {
    return this.delegate[method];
  }
}

function decorator(collection, config) {
  return new Proxy(new QueryBase(collection, config), {
    get(target, p) {
      if (LINK_QUERY_PROFILE.includes(p)) {
        return target[p];
      }

      return target.origin(p);
    },
  });
}

module.exports = {
  decorator,
};
