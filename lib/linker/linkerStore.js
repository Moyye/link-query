const BaseClass = require('../baseUtils/baseClass.js');
const Linker = require('./linker.js');

class LinkerStore extends BaseClass {
  constructor() {
    super();
    this.store = {};
    this.nameStore = [];
  }

  add(name, config) {
    if (this.nameStore.includes(name)) {
      throw new Error(`${ name } has been defined elsewhere`);
    }

    let linker = Linker.new(name, config);
    this.nameStore.push(name);
    this.store[name] = linker;
  }

  get(name) {
    return this.store[name];
  }

  allNames() {
    return this.nameStore;
  }

  isEmpty() {
    return _.isEmpty(this.nameStore);
  }

  deleteAll() {
    this.store = {};
    this.nameStore = [];
  }

  count() {
    return this.nameStore.length;
  }
}

module.exports = LinkerStore;