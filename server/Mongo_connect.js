// we use MongClient
const {MongoClient} = require('mongodb');
var MONGO_URI = "";
const MONGODB_DB_NAME = "clear-fashion";
var client;
var db;
var collection;
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

async function PushtoMongoDb(){
    await connectMongoDb();
    console.log('Deleting old products from MongoDB ...');
    await collection.deleteMany({});
    console.log('Inserting products into MongoDB ...'); 
    var data = fs.readFileSync('scrapedproducts.json');
    var products = JSON.parse(data);
    const results = await collection.insertMany(products);
    //ordered = false;
    console.log(results);
    console.log('Done!');
    process.exit(0);
}
// we use "sort" and "filter" to sort and filter the products
// here we want to fetch the products in function of the parameters
async function fetchproducts(brand = undefined, lessthan = undefined, sortedbyprice = false, sortedbydate = false, onlynewproducts = false){
    await connectMongoDb();
    console.log('Fetching products from MongoDB ...');
    var query = {};
    var result = await collection.find(query);
    if(brand != undefined){
        query.brand = brand;
    }
    if(lessthan != undefined){
        query.price = {$lt: lessthan};
    }
    if(sortedbyprice){
        result = result.sort({price: 1});
    }
    if(sortedbydate){
        result = result.sort({date: -1});
    }
    result = await result.toArray();
    if(onlynewproducts){
        result = result.filter((product) => new Date(product.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // products that are less than 30 days old
    }
    console.log(result);
    process.exit(0);
}

//PushtoMongoDb();
fetchproducts(brand = 'Dedicated', lessthan = 100, sortedbyprice = true, sortedbydate = true, onlynewproducts = true);