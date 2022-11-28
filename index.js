const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8uogbca.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        const phoneInfoCollection = client.db('resellService').collection('phoneInfo');
        const bookingCollection = client.db('resellService').collection('bookingInfo');

        app.get('/phoneInfoCollection', async(req, res) => {
            const query = {};
            const phoneInfo = await phoneInfoCollection.find(query).toArray();
            res.send(phoneInfo);
        })

        app.post('/bookings', async(req, res) =>{
            const booking = req.body
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

        app.post('/phoneInfoCollection', async(req, res) =>{
            const added = req.body
            const result = await phoneInfoCollection.insertOne(added);
            res.send(result);
        })
    }
    finally{

    }
}
run().catch(console.log);


app.get('/', async(req, res) =>{
    res.send('Our server Running');
})

app.listen(port, () => console.log(`Portal Running on ${port}`))