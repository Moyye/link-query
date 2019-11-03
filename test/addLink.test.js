const assert = require('assert');
require('../index');
const getCollectionByName = require('./db');
const { PREFIX_LINKS } = require('../lib/constants');

let TestConn;
before(async () => {
  TestConn = await getCollectionByName('test');
  await TestConn.insertOne({ a: 1 })
});

describe('addLink', function () {
  it('添加属性正常', async () => {
    TestConn.addLinks({
      testLink: {
        collection: TestConn,
        field: 'a',
        type: 'one',
        index: true,
      },
    });

    assert.notEqual(TestConn[PREFIX_LINKS], undefined)
  });
});