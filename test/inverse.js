const assert = require('assert');
require('../index');
const getCollectionByName = require('./db');


let TestConn;
let LinkConn;
before(async () => {
  TestConn = await getCollectionByName('test');
  LinkConn = await getCollectionByName('link');
  const { insertedId } = await LinkConn.insertOne({ b: 1 });
  const { insertedId: testId } = await TestConn.insertOne({ a: 1, linkId: insertedId });
  await LinkConn.updateOne({ _id: insertedId }, { $set: { testId: testId } });
});

describe('linkQuery', function () {
  it('link单层正常', async () => {
    TestConn.linkAdd({
      testInverse: {
        collection: LinkConn,
        field: 'linkId',
        targetId: '_id', // default _id
        type: 'one',
        index: true,
        inverse: {
          name: 'tests',
          type: 'many',// default many, return array
        },
      },
    });

    let res = await TestConn.linkQuery({
      $filters: {
        linkId: {
          $exists: true,
        },
      },
      linkId: 1,
      $options: {},
      testInverse: {
        b: 1,
      },

    }).fetch();

    assert.ok(res[0].linkId.toString() === res[0].testInverse._id.toString());
  });
});
