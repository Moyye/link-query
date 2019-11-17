const assert = require('assert')
require('../index')
const getCollectionByName = require('./db')

let TestConn
before(async () => {
  TestConn = await getCollectionByName('test')
  await TestConn.insertOne({ a: 1 })
})

describe('addLink', function () {
  it('添加属性正常', async () => {
    TestConn.linkAdd({
      testLink: {
        collection: TestConn,
        field: 'a',
        type: 'one',
        index: true,
      },
    })

    assert.equal(TestConn.linkCount(), 1)
  })
})