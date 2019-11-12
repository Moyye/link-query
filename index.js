require('./lib/extension');
require('./lib/fetch');

global.log = console.log.bind(console)
global._ = require('lodash');