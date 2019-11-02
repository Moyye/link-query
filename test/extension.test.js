const assert = require('assert');
require('../index');
const getCollectionByName = require('./db');


let TestConn;
before(async () => {
  TestConn = await getCollectionByName('test');
  await TestConn.insertOne({ a: 1 })
});

describe('extension', function () {
  it('linkQuery正常', async () => {
    const res = await TestConn.linkQuery({}).toArray();
    assert.notEqual(res, null)
  });
  it('fetch正常', async () => {
    const res = await TestConn.linkQuery({}).fetch();
    assert.notEqual(res, undefined)
  })
});