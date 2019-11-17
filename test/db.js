const { MongoClient } = require('mongodb')

const url = 'mongodb://localhost:27017'
let client = null

module.exports = async (collectionName) => {
  if (!client) {
    client = await MongoClient.connect(url, { useUnifiedTopology: true })
  }

  return client.db('test').collection(collectionName)
}
