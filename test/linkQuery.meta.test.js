const assert = require('assert');
require('../index');
const getCollectionByName = require('./db');


let PeopleConn;
let BlogConn;
before(async function () {
  PeopleConn = await getCollectionByName('people_meta');
  BlogConn = await getCollectionByName('blog_meta');
  const { insertedIds } = await BlogConn.insertMany([
    { title: `blogTitle ${ new Date() }` },
    { title: `blogTitle ${ new Date() }` },
    { title: `blogTitle ${ new Date() }` },
    { title: `blogTitle ${ new Date() }` },
  ]);
  await PeopleConn.insertOne({
    name: `name ${ new Date() }`, blog: Object.values(insertedIds).map((id) => {
      return {
        _id: id,
        name: `testLinkName ${ id.toString() }`
      }
    })
  });
});

describe('linkQuery many', function () {
  it('link many正常', async () => {
    PeopleConn.removeLinks();
    BlogConn.removeLinks();

    PeopleConn.addLinks({
      blogs: {
        collection: BlogConn,
        type: 'meta',
        field: 'blog._id',
      },
    });

    const res = await PeopleConn.linkQuery({
      $options: {
        sort: { _id: -1 }
      },
      blog: 1,
      blogs: {
        title: 1
      },
    }).fetchOne();

    assert.ok(res.blogs.length === res.blog.length)
  });
});