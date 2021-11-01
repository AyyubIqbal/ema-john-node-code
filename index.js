const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const { query } = require('express');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sc2zp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        client.connect();
        // console.log('database conneted successfully');
        const database = client.db('onlineShop');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders');

        // get api
        app.get('/products', async (req, res) => {
            // console.log(req.query);
            const cursor = productCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const count = await cursor.count();
            let products;
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray()
            }
            else {
                products = await cursor.toArray();
            }

            res.send({
                count,
                products
            })
        });

        // use POST to get data by keys 
        app.post('/products/byKeys', async (req, res) => {
            const keys = req.body;
            // console.log(keys);
            const query = { keys: { $in: keys } };
            const products = await productCollection.find(query).toArray()
            res.json(products)
        });

        // Add Orders API 
        app.post('/orders', async (req, res) => {
            const order = req.body;
            // console.log('order', order);
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })
    }
    catch {
        // await client.close()
    }
}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('eme-jonh server side')
})

app.listen(port, () => {
    console.log('Running on port', port);
})