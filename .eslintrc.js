const OFF = 0;
const WARN = 1;
const ERROR = 2;

module.exports = exports = {
    "extends": "eslint:recommended",
    env: {
        'es6': true, // We are writing ES6 code
        'node': true, // for node.js
    },
    "rules": {
        "indent": ["error", 2],
        "no-console": OFF,
    }
}
