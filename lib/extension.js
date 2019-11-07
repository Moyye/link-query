const _ = require('lodash');
const { Collection, Cursor } = require('mongodb');
const Query = require('./linkQuery');
const Link = require('./link');
const { PREFIX_LINKS } = require('./constants');

_.extend(Collection.prototype, {
  linkQuery(body) {
    return new Query(this, body);
  },
  addLinks(params = {}) {
    if (!this[PREFIX_LINKS]) {
      this[PREFIX_LINKS] = {};
    }

    for (let [field, config] of Object.entries(params)) {
      new Link(this, field, config)
    }
  },
  removeLinks() {
    delete this[PREFIX_LINKS]
  }
});

_.extend(Cursor.prototype, {
  fetch(...args) {
    return this.toArray(...args);
  }
});

