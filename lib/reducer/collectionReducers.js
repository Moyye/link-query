const BaseClass = require('../baseUtils/baseClass.js')


class CollectionReducers extends BaseClass {
  constructor() {
    super()
    this.store = {}
  }
  add(name, config) {
    this.store[name] = config
  }
  get(name) {
    return this.store[name]
  }
  apply(results) {
    for (const name of Object.keys(this.store)) {
      let config = this.store[name]
      let reduceFunction = config.reduceFunction
      // use 'forEach' to modify the result but not generate a new one
      results.forEach(record => {
        record[name] = reduceFunction(record)
      });
    }
  }
  isEmpty() {
    return _.isEmpty(this.store)
  }
}

module.exports = CollectionReducers