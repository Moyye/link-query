const _ = require('lodash');
const { Collection, Cursor } = require('mongodb');
const Query = require('./linkQuery');

_.extend(Collection.prototype, {
  linkQuery(body) {
    return new Query(this, body);
  },
});

_.extend(Cursor.prototype, {
  fetch(...args) {
    return this.toArray(...args);
  },
});

