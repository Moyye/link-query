const assert = require('assert');
require('../index');
const getCollectionByName = require('./db');


describe('Reducer test', function () {
    it('test add reducer one', async () => {
        // 1. init db connector
        let UserConn = await getCollectionByName('user');
        // 2. add reducer
        UserConn.addReducer({
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
            }

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
    });
});