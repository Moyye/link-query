const assert = require('assert');
const { getCollection } = require('./db');
const { decorator } = require('../src/QueryBase');


describe('query装饰器挂载', function () {
  let TestConn;
  before(async () => {
    [TestConn] = await getCollection('Test');
    await TestConn.insertOne({ a: 1 });
  });

  it('挂载正常', async () => {
    const TestConnDecorator = decorator(TestConn, {});
    TestConnDecorator.addLinker({});
  });

  it('数据查询正常', async () => {

    const TestConnDecorator = decorator(TestConn, {});
    const result = await TestConnDecorator.findOne({});
    assert.notEqual(result, null);

  });

  after(async () => {
    await TestConn.deleteMany({});
  });
});

describe('query.addLinker', function () {
  let UserConn, BlogConn;
  before(async () => {
    [UserConn, BlogConn] = await getCollection('User', 'Blog');

    const { insertedId } = await UserConn.insertOne({
      name: 'bob',
      sex: 'man',
    });
    await BlogConn.insertMany([
      { title: `blogTitle ${ Math.random().toString(36).substring(7) }`, userId: insertedId },
      { title: `blogTitle ${ Math.random().toString(36).substring(7) }`, userId: insertedId },
      { title: `blogTitle ${ Math.random().toString(36).substring(7) }`, userId: insertedId },
      { title: `blogTitle ${ Math.random().toString(36).substring(7) }`, userId: insertedId },
      { title: `blogTitle ${ Math.random().toString(36).substring(7) }`, userId: insertedId },
    ]);
  });

  it('空对象正常', async () => {
    const User = decorator(UserConn, {});
    User.addLinker({});
  });

  it('正常配值', async () => {
    const User = decorator(UserConn, {
      blog: {
        collection: BlogConn,
        type: 'many',
        foreignField: 'userId',
      },
    });

    assert.ok(User._linkers.get('blog'));
  });

  it('inverse', async () => {
    const User = decorator(UserConn);
    const Blog = decorator(BlogConn);

    User.addLinker({
      blog: {
        collection: Blog,
        type: 'many',
        foreignField: 'userId',
        inverse: {
          user: {
            type: 'one',
          },
          users: {
            type: 'many',
          },
        },
      },
    });

    assert.ok(Blog._linkers.get('user'));
    assert.ok(Blog._linkers.get('users'));
  });

  it('collection配置', async () => {
    assert.throws(() => {
      decorator(UserConn, {
        blog: {
          collection: 'BlogConn',
          type: 'many',
          foreignField: 'userId',
        },
      });
    });
    assert.throws(() => {
      decorator(UserConn, {
        blog: {
          collection: {},
          type: 'many',
          foreignField: 'userId',
        },
      });
    });
    assert.throws(() => {
      decorator(UserConn, {
        blog: {
          collection: null,
          type: 'many',
          foreignField: 'userId',
        },
      });
    });
  });

  it('type配置', async () => {
    decorator(UserConn, {
      blog: {
        collection: BlogConn,
        type: 'one',
        foreignField: 'userId',
      },
    });
    decorator(UserConn, {
      blog: {
        collection: BlogConn,
        type: 'many',
        foreignField: 'userId',
      },
    });
    assert.throws(() => {
      decorator(UserConn, {
        blog: {
          collection: BlogConn,
          type: 'meta-error',
          foreignField: 'userId',
        },
      });
    });
  });

  it('重复配置', async () => {
    const User = decorator(UserConn, {
      blog: {
        collection: BlogConn,
        foreignField: 'userId',
      },
    });

    assert.throws(() => {
      User.addLinker({
        blog: {
          collection: BlogConn,
          foreignField: 'userId',
        },
      });
    });
  });


  after(async () => {
    await UserConn.removeMany({});
    await BlogConn.removeMany({});
  });
});

describe('query.linkQuery', function () {
  let UserConn, BlogConn;
  before(async () => {
    [UserConn, BlogConn] = await getCollection('User', 'Blog');

    const { insertedId } = await UserConn.insertOne({
      name: 'bob',
      sex: 'man',
    });
    await BlogConn.insertMany([
      { title: `blogTitle ${ Math.random().toString(36).substring(7) }`, userId: insertedId },
      { title: `blogTitle ${ Math.random().toString(36).substring(7) }`, userId: insertedId },
      { title: `blogTitle ${ Math.random().toString(36).substring(7) }`, userId: insertedId },
      { title: `blogTitle ${ Math.random().toString(36).substring(7) }`, userId: insertedId },
      { title: `blogTitle ${ Math.random().toString(36).substring(7) }`, userId: insertedId },
    ]);
  });


  it('普通query查询正常', async () => {
    const User = decorator(UserConn, {
      blog: {
        collection: BlogConn,
        type: 'many',
        foreignField: 'userId',
      },
    });

    const users = await User.linkQuery({
      name: 1,
    }).fetch();
    assert.ok(users.length >= 1);

    const user = await User.linkQuery({
      name: 1,
    }).fetchOne();
    assert.ok(user.name);
  });

  it('普通query-localField-one单次连接正常', async () => {
    const Blog = decorator(BlogConn, {
      user: {
        type: 'one',
        localField: 'userId',
        collection: UserConn,
      },
    });

    const blog = await Blog.linkQuery({
      title: 1,
      user: {
        name: 1,
      },
    }).fetchOne();

    assert.equal(blog.userId.toString(), blog.user._id.toString());
  });

  it('普通query-foreignField-one单词连接正常', async () => {
    const User = decorator(UserConn, {
      blog: {
        type: 'one',
        localField: '_id',
        foreignField: 'userId',
        collection: BlogConn,
      },
    });

    const user = await User.linkQuery({
      name: 1,
      blog: {
        title: 1,
      },
    }).fetchOne();

    assert.equal(user._id.toString(), user.blog.userId.toString());
  });

  it('普通query-localField-many单次连接正常', async () => {
    const Blog = decorator(BlogConn, {
      user: {
        type: 'many',
        localField: 'userId',
        collection: UserConn,
      },
    });

    const blog = await Blog.linkQuery({
      title: 1,
      user: {
        name: 1,
      },
    }).fetchOne();

    assert.equal(blog.userId.toString(), blog.user[0]._id.toString());
  });

  it('普通query-foreignField-many单词连接正常', async () => {
    const User = decorator(UserConn, {
      blog: {
        type: 'many',
        localField: '_id',
        foreignField: 'userId',
        collection: BlogConn,
      },
    });

    const user = await User.linkQuery({
      name: 1,
      blog: {
        title: 1,
      },
    }).fetchOne();

    assert.equal(user._id.toString(), user.blog[0].userId.toString());
    assert.ok(user.blog.length > 1);
  });

  after(async () => {
    await UserConn.removeMany({});
    await BlogConn.removeMany({});
  });
});

describe('query.linkQuery-meta', function () {
  let UserConn, BlogConn;
  before(async () => {
    [UserConn, BlogConn] = await getCollection('User', 'Blog');

    const { insertedId } = await UserConn.insertOne({
      name: 'bob',
      sex: 'man',
    });
    const { insertedIds: blogIds } = await BlogConn.insertMany([
      {
        title: `blogTitle ${ Math.random().toString(36).substring(7) }`,
        userId: insertedId,
        user: { _id: insertedId },
      },
      {
        title: `blogTitle ${ Math.random().toString(36).substring(7) }`,
        userId: insertedId,
        user: { _id: insertedId },
      },
      {
        title: `blogTitle ${ Math.random().toString(36).substring(7) }`,
        userId: insertedId,
        user: { _id: insertedId },
      },
      {
        title: `blogTitle ${ Math.random().toString(36).substring(7) }`,
        userId: insertedId,
        user: { _id: insertedId },
      },
      {
        title: `blogTitle ${ Math.random().toString(36).substring(7) }`,
        userId: insertedId,
        user: { _id: insertedId },
      },
    ]);

    UserConn.updateOne({ _id: insertedId }, {
      $set: {
        blog: {
          _id: Object.values(blogIds)[0],
        },
      },
    });
  });

  it('query-localField-one单次连接正常', async () => {
    const Blog = decorator(BlogConn, {
      userLink: {
        type: 'one',
        localField: 'user._id',
        collection: UserConn,
      },
    });

    const blog = await Blog.linkQuery({
      title: 1,
      userLink: {
        name: 1,
      },
    }).fetchOne();

    assert.equal(blog.user._id.toString(), blog.userLink._id.toString());
  });

  it('query-localField-many单次连接正常', async () => {
    const Blog = decorator(BlogConn, {
      userLink: {
        type: 'many',
        localField: 'user._id',
        collection: UserConn,
      },
    });

    const blog = await Blog.linkQuery({
      title: 1,
      userLink: {
        name: 1,
      },
    }).fetchOne();

    assert.equal(blog.user._id.toString(), blog.userLink[0]._id.toString());
  });

  it('query-foreignField-one单次连接正常', async () => {
    const User = decorator(UserConn, {
      blogLink: {
        type: 'one',
        foreignField: 'user._id',
        collection: BlogConn,
      },
    });

    const user = await User.linkQuery({
      name: 1,
      blogLink: {
        title: 1,
      },
    }).fetchOne();

    assert.equal(user._id.toString(), user.blogLink.user._id.toString());
  });

  it('query-foreignField-many单次连接正常', async () => {
    const User = decorator(UserConn, {
      blogLink: {
        type: 'many',
        foreignField: 'user._id',
        collection: BlogConn,
      },
    });

    const user = await User.linkQuery({
      name: 1,
      blogLink: {
        title: 1,
      },
    }).fetchOne();

    assert.equal(user._id.toString(), user.blogLink[0].user._id.toString());
  });

  after(async () => {
    await UserConn.removeMany({});
    await BlogConn.removeMany({});
  });
});

describe('query.linkQuery-嵌套', function () {
  let UserConn, BlogConn;
  before(async () => {
    [UserConn, BlogConn] = await getCollection('User', 'Blog');

    const { insertedId } = await UserConn.insertOne({
      name: 'bob',
      sex: 'man',
    });
    const { insertedIds: blogIds } = await BlogConn.insertMany([
      {
        title: `blogTitle ${ Math.random().toString(36).substring(7) }`,
        userId: insertedId,
        user: { _id: insertedId },
      },
      {
        title: `blogTitle ${ Math.random().toString(36).substring(7) }`,
        userId: insertedId,
        user: { _id: insertedId },
      },
      {
        title: `blogTitle ${ Math.random().toString(36).substring(7) }`,
        userId: insertedId,
        user: { _id: insertedId },
      },
      {
        title: `blogTitle ${ Math.random().toString(36).substring(7) }`,
        userId: insertedId,
        user: { _id: insertedId },
      },
      {
        title: `blogTitle ${ Math.random().toString(36).substring(7) }`,
        userId: insertedId,
        user: { _id: insertedId },
      },
    ]);

    UserConn.updateOne({ _id: insertedId }, {
      $set: {
        blog: {
          _id: Object.values(blogIds)[0],
        },
      },
    });
  });

  it('meta-one嵌套正常', async () => {
    const Blog = decorator(BlogConn);
    const User = decorator(UserConn);

    Blog.addLinker({
      userLink: {
        type: 'one',
        localField: 'user._id',
        collection: User,
      },
    });
    User.addLinker({
      blogLink: {
        type: 'one',
        foreignField: 'user._id',
        collection: Blog,
      },
    });

    const user = await User.linkQuery({
      name: 1,
      blogLink: {
        title: 1,
        userLink: {
          name: 1,
          blogLink: {
            title: 1,
          },
        },
      },
    }).fetchOne();

    assert.ok(user.blogLink.userLink.blogLink.title);
  });

  it('meta-many嵌套正常', async () => {
    const Blog = decorator(BlogConn);
    const User = decorator(UserConn);

    Blog.addLinker({
      userLink: {
        type: 'one',
        localField: 'user._id',
        collection: User,
      },
    });
    User.addLinker({
      blogLink: {
        type: 'many',
        foreignField: 'user._id',
        collection: Blog,
      },
    });

    const user = await User.linkQuery({
      name: 1,
      blogLink: {
        title: 1,
        userLink: {
          name: 1,
        },
      },
    }).fetchOne();

    assert.ok(user.blogLink.map(v => assert.ok(v.userLink.name)).length > 1);
  });


  after(async () => {
    await UserConn.removeMany({});
    await BlogConn.removeMany({});
  });
});
