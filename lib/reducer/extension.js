const _ = require('lodash')
const {
  Collection,
} = require('mongodb')
const ReducerStore = require('./reducerStore.js')


_.extend(Collection.prototype, {
  _reducerStore: ReducerStore.new(),
  reducerAdd(reducers) {
    for (const name of Object.keys(reducers)) {
      let config = reducers[name]
      this._reducerStore.add(name, config)
    }
  },
  reducerApply(records) {
    let reducerStore = this._reducerStore
    if (!reducerStore.isEmpty()) {
      reducerStore.apply(records)
    }
  },
})