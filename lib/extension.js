const _ = require('lodash');
const { Collection, Cursor } = require('mongodb');

_.extend(Collection.prototype, {
  linkQuery(...args) {
    return this.find(...args);
  },
});

_.extend(Cursor.prototype, {
  fetch(...args) {
    return this.toArray(...args);
  }
});

