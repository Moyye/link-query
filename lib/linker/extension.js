const _ = require('lodash');
const { Collection } = require('mongodb');
const LinkerStore = require('./linkerStore');

_.extend(Collection.prototype, {
  _linkerStore: LinkerStore.new(),
  linkAdd(linkers = {}) {
    let linkerStore = this._linkerStore;
    for (const name of Object.keys(linkers)) {
      let config = linkers[name];
      linkerStore.add(name, config);
    }
  },
  linkGet(name) {
    let linkerStore = this._linkerStore;
    return linkerStore.get(name).config;
  },
  linkGetAllNames() {
    let linkerStore = this._linkerStore;
    return linkerStore.allNames();
  },
  linkClear() {
    let linkerStore = this._linkerStore;
    linkerStore.deleteAll();
  },
  linkCount() {
    let linkerStore = this._linkerStore;
    return linkerStore.count();
  },
});