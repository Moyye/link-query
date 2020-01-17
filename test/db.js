const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
let client = null;

async function getCollectionByName(collectionName) {
  if (!client) {
    client = await MongoClient.connect(url, { useUnifiedTopology: true });
  }

  return client.db('test2').collection(collectionName);
}


function getCollection(...names) {
  return Promise.all(names.map(v => getCollectionByName(v)));
}

module.exports = {
  getCollection,
};
