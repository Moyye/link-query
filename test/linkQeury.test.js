const assert = require('assert');
require('../index');
const getCollectionByName = require('./db');


let TestConn;
let LinkConn;
before(async () => {
  TestConn = await getCollectionByName('test');
  LinkConn = await getCollectionByName('link');
  const { insertedId } = await LinkConn.insertOne({ b: 1 });
  await TestConn.insertOne({ a: 1, linkId: insertedId })
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
  });

  it('link单层正常', async () => {
    TestConn.addLinks({
      testLink: {
        collection: 'link',
        field: 'linkId',
        type: 'one',
        index: true,
      },
      testLink1: {
        collection: 'link',
        field: 'linkId',
        type: 'one',
        index: true,
      },
      testLink2: {
        collection: 'link',
        field: 'linkId',
        type: 'one',
        index: true,
      },
      testLink3: {
        collection: 'link',
        field: 'linkId',
        type: 'one',
        index: true,
      },
    });

    const res = await TestConn.linkQuery({
      $options: {
      },
      testLink: {
        b: 1
      },
      testLink1: {
        b: 1
      },
      testLink2: {
        b: 1
      },
      testLink3: {
        b: 1
      },
    }).fetch();
    assert.ok(res[0].linkId.toString() === res[0].testLink._id.toString())
  })
});