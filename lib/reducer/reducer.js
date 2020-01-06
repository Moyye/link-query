const BaseClass = require('../baseUtils/baseClass.js');


class Reducer extends BaseClass {
  constructor(name, config) {
    super();
    this.name = name;
    this.body = config.body;
    this.action = config.reduceFunction;
  }

  apply(record) {
    return this.action(record);
  }
}

module.exports = Reducer;