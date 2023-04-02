

//_______________________________________________________________________________________

// we use MongClient
const {MongoClient} = require('mongodb');
var MONGO_URI = "";
const MONGODB_DB_NAME = "clear-fashion";
var client;
var db;
var collection;
var result;
const fs = require('fs');

async function connectMongoDb(){
    var key = fs.readFileSync('key.json');
    key = JSON.parse(key);
    MONGODB_URI = key.MONGODB_URI;
    console.log('Connecting to MongoDB ...');
    client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
    db =  client.db(MONGODB_DB_NAME)
    collection = db.collection('products');
}

async function fetchproducts(brand = undefined, lessthan = undefined, sortedbyprice = false, sortedbydate = false, onlynewproducts = false, id = undefined){
  await connectMongoDb();
  console.log('Fetching products from MongoDB ...');
  var query = {};
  if(brand != undefined){
      query.brand = brand;
  }
  if(lessthan != undefined){
      query.price = {$lte: Number(lessthan)};
  }
  result = await collection.find(query);
  if(sortedbyprice){
      result = result.sort({price: 1});
  }
  if(sortedbydate){
      result = result.sort({date: -1});
  }
  var products = await result.toArray();
  if(onlynewproducts){
      products = products.filter((product) => new Date(product.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // products that are less than 30 days old
  }
  if(id != undefined){
      products = products.filter((product) => product._id.valueOf() == id);
  }
  return products;
  //console.log(result);  
  //process.exit(0);
}

//_______________________________________________________________________________________

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/products', async (request, response) => {
  response.json(await fetchproducts()); 
});

app.get('/products/search', async (request, response) => {

  var limit = request.query.limit;
  var brand = request.query.brand;
  var price = request.query.price;
  // if limit is not defined, we set it to 12
  if(limit == undefined){ // === ?
      limit = 12;
  }
  var products = await fetchproducts(brand = brand, lessthan = price, sortedbyprice = true, sortedbydate = false, onlynewproducts = false, id = undefined);
  products = products.slice(0,limit);
  const output = {
    limit: limit,
    total: products.length,
    results: products
  };
  response.json(output);
  //example http://localhost:8092/products/search?limit=10&brand=Dedicated&price=50
});

app.get('/products/:id', async (request, response) => {
  //console.log(await fetchproducts());
  response.json(await fetchproducts(brand = undefined, lessthan = undefined, sortedbyprice = false, sortedbydate = false, onlynewproducts = false, id = request.params.id)); 
  // exemple : http://localhost:8092/products/6419c4a2553ee3b36b2ab8e2
});



app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);




