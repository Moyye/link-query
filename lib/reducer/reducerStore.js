const BaseClass = require('../baseUtils/baseClass.js')
const Reducer = require('./reducer.js')


class ReducerStore extends BaseClass {
  constructor() {
    super()
    this.store = {}
    this.nameStore = []
  }
  add(name, config) {
    let reducer = Reducer.new(name, config)
    // TODO: ducplication check
    this.nameStore.push(name)
    this.store[name] = reducer
  }
  get(name) {
    return this.store[name]
  }
  apply(results) {
    for (const name of this.nameStore) {
      let reducer = this.store[name]
      // use 'forEach' to modify the result but not generate a new one
      results.forEach(record => {
        record[name] = reducer.apply(record)
      });
    }
  }
  isEmpty() {
    return _.isEmpty(this.nameStore)
  }
}

module.exports = ReducerStore