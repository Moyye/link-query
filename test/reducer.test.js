const assert = require('assert')
const getCollectionByName = require('./db')
require('../index')


describe('Reducer test', function () {
  it('test add reducer one', async () => {
    // 1. init db connector
    let UserConn = await getCollectionByName('user')
    // 2. add reducer
    UserConn.reducerAdd({
      fullName: {
        body: {
          firstName: 1,
          lastName: 1,
        },
        reduceFunction(object) {
          let {
            firstName,
            lastName,
          } = object
          return `${firstName} ${lastName}`
        },
      },

    })
    // 3. insert data
    let userInfo = {
      firstName: 'Hari',
      lastName: 'Seldon',
    }
    await UserConn.insertOne(userInfo)
    // 4. query and fetch
    let user = await UserConn.linkQuery({
      firstName: 1,
      lastName: 1,
    }).fetchOne()
    // 5. compare result
    assert.ok(user.fullName == `${userInfo.firstName} ${userInfo.lastName}`)
  })
  it('test add reducer many', async () => {
    // 1. init db connector
    let UserConn = await getCollectionByName('user')
    // 2. add reducer
    UserConn.reducerAdd({
      fullName: {
        body: {
          firstName: 1,
          lastName: 1,
        },
        reduceFunction(object) {
          let {
            firstName,
            lastName,
          } = object
          return `${firstName} ${lastName}`
        },
      },
      nickname: {
        body: {
          firstName: 1,
          lastName: 1,
        },
        reduceFunction(object) {
          let {
            firstName,
            lastName,
          } = object
          return `nickname $$${firstName} ${lastName}$$`
        },
      },
    })
    // 3. insert data
    // TODO: remove insert data and add texture for test
    let userInfo = [
      {
        firstName: 'Hari',
        lastName: 'Seldon',
      }, {
        firstName: 'Gaal',
        lastName: 'Dornick',
      }, 
    ]
    await UserConn.insertMany(userInfo)
    // 4. query and fetch
    let users = await UserConn.linkQuery({
      firstName: 1,
      lastName: 1,
    }).fetch()
    // 5. compare result
    users.forEach(user => {
      assert.ok(user.fullName == `${user.firstName} ${user.lastName}`)
      assert.ok(user.nickname == `nickname $$${user.firstName} ${user.lastName}$$`)
    })
  })
})