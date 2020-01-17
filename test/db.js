const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017';

// mongodb
let client = null;

async function getCollectionByName(collectionName) {
  if (!client) {
    client = await MongoClient.connect(url, { useUnifiedTopology: true });
  }

  return client.db('test2').collection(collectionName);
}

// mongoose
let init = false;
const db = mongoose.connection;
mongoose.connect(`${ url }/test2`, { useNewUrlParser: true, useUnifiedTopology: true });

async function getCollectionByName2(collectionName) {
  if (!init) {
    await new Promise((resolve => {
      db.once('open', function () {
        resolve();
      });
    }));
    init = true;
  }

  return mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }));
}

function getCollection(...names) {
  return Promise.all(names.map(v => getCollectionByName(v)));
}

function getCollection2(...names) {
  return Promise.all(names.map(v => getCollectionByName2(v)));
}


module.exports = {
  getCollection,
  getCollection2,
};
