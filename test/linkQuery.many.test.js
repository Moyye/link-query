const assert = require('assert');
require('../index');
const getCollectionByName = require('./db');


let PeopleConn;
let BlogConn;
before(async function () {
  PeopleConn = await getCollectionByName('people');
  BlogConn = await getCollectionByName('blog');
  const { insertedIds } = await BlogConn.insertMany([
    { title: `blogTitle ${ new Date() }` },
    { title: `blogTitle ${ new Date() }` },
    { title: `blogTitle ${ new Date() }` },
    { title: `blogTitle ${ new Date() }` },
  ]);
  await PeopleConn.insertOne({ name: `name ${ new Date() }`, blogIds: Object.values(insertedIds) });
});

describe('linkQuery many', function () {
  it('link many正常', async () => {
    PeopleConn.removeLinks();
    BlogConn.removeLinks();

    PeopleConn.addLinks({
      blog: {
        collection: BlogConn,
        field: 'blogIds',
        type: 'many',
        index: true,
      },
    });

    const res = await PeopleConn.linkQuery({
      $options: {
        sort: { _id: -1 }
      },
      blogIds: 1,
      blog: {
        title: 1
      },
    }).fetchOne();

    assert.ok(res.blogIds.length === res.blog.length)
  });
});