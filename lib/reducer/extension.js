const _ = require('lodash');
const {
    Collection,
} = require('mongodb');
const CollectionReducers = require('./collectionReducers.js')


_.extend(Collection.prototype, {
    _reducerStore: CollectionReducers.new(),
    addReducer(reducers) {
        let reducerStore = Collection.prototype._reducerStore
        for (const name of Object.keys(reducers)) {
            let config = reducers[name]
            reducerStore.add(name, config)
        }
    },
    applyReducer(records) {
        let reducerStore = Collection.prototype._reducerStore
        if (!reducerStore.isEmpty()) {
            reducerStore.apply(records)
        }
    }
})