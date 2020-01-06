const assert = require('assert');
const _ = require('lodash');
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
  it('sort正常', async () => {
    const res1 = await TestConn.linkQuery({
      $options: {
        sort: {
          _id: 1,
        },
      },
    }).fetch();
    const res2 = await TestConn.linkQuery({
      $options: {
        sort: {
          _id: -1,
        },
      },
    }).fetch();

    assert.ok(res1[0]._id.toString() !== res2[0]._id.toString());
  });

  it('limit正常', async () => {
    const res = await TestConn.linkQuery({
      $options: {
        limit: 1,
      },
    }).fetch();

    assert.ok(res.length === 1);
  });

  it('skip正常', async () => {
    const res1 = await TestConn.linkQuery({
      $options: {},
    }).fetch();
    const res2 = await TestConn.linkQuery({
      $options: {
        skip: 1,
      },
    }).fetch();

    assert.ok((res1.length - res2.length) === 1);
  });

  it('link单层正常', async () => {
    TestConn.linkAdd({
      testLink: {
        collection: LinkConn,
        field: 'linkId',
        type: 'one',
        index: true,
      },
      testLink1: {
        collection: LinkConn,
        field: 'linkId',
        type: 'one',
        index: true,
      },
      testLink2: {
        collection: LinkConn,
        field: 'linkId',
        type: 'one',
        index: true,
      },
      testLink3: {
        collection: LinkConn,
        field: 'linkId',
        type: 'one',
        index: true,
      },
    });

    let res = await TestConn.linkQuery({
      $filters: {
        linkId: {
          $exists: true,
        },
      },
      $options: {},
      testLink: {
        b: 1,
      },
      linkId: 1,
      testLink1: {
        b: 1,
      },
      testLink2: {
        b: 1,
      },
      testLink3: {
        b: 1,
      },
    }).fetch();

    assert.ok(res[0].linkId.toString() === res[0].testLink._id.toString());
  });

  it('link多层嵌套层正常', async () => {
    TestConn.linkClear();
    LinkConn.linkClear();

    TestConn.linkAdd({
      link: {
        collection: LinkConn,
        field: 'linkId',
        type: 'one',
        index: true,
      },
    });

    LinkConn.linkAdd({
      test: {
        collection: TestConn,
        field: 'testId',
        type: 'one',
        index: true,
      },
    });

    const res = await TestConn.linkQuery({
      $filters: {
        linkId: {
          $exists: true,
        },
      },
      $options: {},
      link: {
        test: {
          link: {},
        },
      },
    }).fetch();
    assert.ok(res[0].link.test.link);
  });

  it('link fetchOne 正常', async () => {
    TestConn.linkClear();

    TestConn.linkAdd({
      link: {
        collection: LinkConn,
        field: 'linkId',
        type: 'one',
        index: true,
      },
    });

    const res = await TestConn.linkQuery({
      $options: {},
      link: {},
    }).fetchOne();

    assert.ok(_.isObject(res));
    assert.ok(!_.isArray(res));
  });


  it('link fetchAll 正常', async () => {
    TestConn.linkClear();

    TestConn.linkAdd({
      link: {
        collection: LinkConn,
        field: 'linkId',
        type: 'one',
        index: true,
      },
    });

    const res = await TestConn.linkQuery({
      $options: {},
      link: {},
    }).fetchAll();

    assert.ok(_.isArray(res));
  });

  it('link count 正常', async () => {
    TestConn.linkClear();

    TestConn.linkAdd({
      link: {
        collection: LinkConn,
        field: 'linkId',
        type: 'one',
        index: true,
      },
    });

    const res = await TestConn.linkQuery({
      $options: {},
      link: {},
    }).fetchAll();

    const count = await TestConn.linkQuery({
      $options: {},
      link: {},
    }).count();

    assert.ok(res.length === count);
  });
});