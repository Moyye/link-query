const assert = require('assert');
require('../index');
const getCollectionByName = require('./db');


let TestConn;
before(async () => {
  TestConn = await getCollectionByName('test');
  await TestConn.insertOne({ a: 1 })
});

describe('extension', function () {
  it('fetch正常', async () => {
    const res = await TestConn.linkQuery({}).fetch();
    assert.ok(!!res)
  });
});