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
        const userCollection = client.db('resellService').collection('userInfo');

        app.get('/phoneInfoCollection', async(req, res) => {
            const query = {};
            const phoneInfo = await phoneInfoCollection.find(query).toArray();
            res.send(phoneInfo);
        })

        app.get('/phoneInfoCollection/:os/:device', async(req, res) => {
            const os = req.params.os;
            const device = req.params.device;
            const query = {os: os, deviceType: device};
            const phoneInfo = await phoneInfoCollection.find(query).toArray();
            res.send(phoneInfo);
        })

        app.get('/phoneInfoCollection/:device', async(req, res) => {
            const device = req.params.device;
            const query = {deviceType: device};
            const phoneInfo = await phoneInfoCollection.find(query).toArray();
            res.send(phoneInfo);
        })

        app.post('/bookings', async(req, res) =>{
            const booking = req.body
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

        app.get('/bookings', async (req, res) =>{
            const email = req.query.email;
            const query = {email: email};
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);
        })

        app.post('/phoneInfoCollection', async(req, res) =>{
            const added = req.body
            const result = await phoneInfoCollection.insertOne(added);
            res.send(result);
        })
        
        app.get('/allPhoneInfo', async (req, res) =>{
            const email = req.query.email;
            const query = {sellerEmail: email};
            const result = await phoneInfoCollection.find(query).toArray();
            res.send(result);
        })
        

        app.post('/users', async (req, res) =>{
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        } )
        app.get('/users', async (req, res) =>{
            const query = {};
            const result = await userCollection.find(query).toArray();
            res.send(result);
        } )
    }
    finally{

    }
}
run().catch(console.log);


app.get('/', async(req, res) =>{
    res.send('Our server Running');
})

app.listen(port, () => console.log(`Portal Running on ${port}`))