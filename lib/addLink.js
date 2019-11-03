const _ = require('lodash');
const { Collection } = require('mongodb');
const { PREFIX_LINKS } = require('./constants');
const Link = require('./link');

_.extend(Collection.prototype, {
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


