const assert = require('assert');
require('../index');
const getCollectionByName = require('./db');


let TestConn;
before(async () => {
  TestConn = await getCollectionByName('test');
  await TestConn.insertOne({ a: 1 })
});

describe('linkQuery', function () {
  it('sort正常', async () => {
    const res1 = await TestConn.linkQuery({
      $options: {
        sort: {
          _id: 1
        },
      }
    }).fetch();
    const res2 = await TestConn.linkQuery({
      $options: {
        sort: {
          _id: -1
        },
      }
    }).fetch();

    assert.ok(res1[0]._id.toString() !== res2[0]._id.toString())
  });

  it('limit正常', async () => {
    const res = await TestConn.linkQuery({
      $options: {
        limit: 1,
      }
    }).fetch();

    assert.ok(res.length === 1)
  });

  it('skip正常', async () => {
    const res1 = await TestConn.linkQuery({
      $options: {}
    }).fetch();
    const res2 = await TestConn.linkQuery({
      $options: {
        skip: 1,
      }
    }).fetch();

    assert.ok((res1.length - res2.length) === 1)
  })
});