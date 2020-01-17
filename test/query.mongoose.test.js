const assert = require('assert');
const { getCollection2 } = require('./db');
const { decorator } = require('../src/QueryBase');

describe('mongoose-正常功能', function () {
  let TestConn;
  before(async () => {
    [TestConn] = await getCollection2('test');
    await TestConn.create({ a: 1 });
  });

  it('挂载正常', async () => {
    const TestConnDecorator = decorator(TestConn, {});
    TestConnDecorator.addLinker({});
  });

  it('数据查询正常', async () => {
    const TestConnDecorator = decorator(TestConn, {});
    const result = await TestConnDecorator.find({});
    assert.notEqual(result, null);
  });

  it('数据插入正常', async () => {
    const TestConnDecorator = decorator(TestConn, {});

    const result1 = await TestConnDecorator.create({ a: 1 });
    const result2 = await new TestConnDecorator({ a: 1 }).save();

    assert.notEqual(result1, null);
    assert.notEqual(result2, null);
  });

  after(async () => {
    await TestConn.deleteMany({});
  });
});

describe('linkQuery-mongoose-正常功能', function () {
  let UserConn, BlogConn;
  before(async () => {
    [UserConn, BlogConn] = await getCollection2('User', 'Blog');

    const { _id } = await UserConn.create({
      name: 'bob',
      sex: 'man',
    });
    await BlogConn.insertMany([
      { title: `blogTitle ${ Math.random().toString(36).substring(7) }`, userId: _id },
      { title: `blogTitle ${ Math.random().toString(36).substring(7) }`, userId: _id },
      { title: `blogTitle ${ Math.random().toString(36).substring(7) }`, userId: _id },
      { title: `blogTitle ${ Math.random().toString(36).substring(7) }`, userId: _id },
      { title: `blogTitle ${ Math.random().toString(36).substring(7) }`, userId: _id },
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
      blog: {
        title: 1,
      },
    }).fetch();
    assert.ok(users.length >= 1);

    const user = await User.linkQuery({
      name: 1,
      blog: {
        title: 1,
      },
    }).fetchOne();

    assert.ok(user.blog.length > 1);
  });


  after(async () => {
    await UserConn.deleteMany({});
    await BlogConn.deleteMany({});
  });
});
