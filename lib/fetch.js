const _ = require('lodash');
const { Cursor } = require('mongodb');

_.extend(Cursor.prototype, {
  fetch(...args) {
    return this.toArray(...args);
  },
});
