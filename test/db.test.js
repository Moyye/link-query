const assert = require('assert');
const { getCollection } = require('./db');

let TestConn = null;
let TestConn1 = null;
let TestConn2 = null;

before(async () => {
  TestConn = await getCollection('Test');
  [TestConn1, TestConn2] = await getCollection('Test1', 'Test2');
});

describe('db', function () {
  it('连接正常', async () => {
    assert.notEqual(TestConn, null);
    assert.notEqual(TestConn1, null);
    assert.notEqual(TestConn2, null);
  });
});
