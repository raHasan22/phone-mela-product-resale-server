const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8uogbca.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('User unauthorized');
    }
    const token = authHeader.split(' ')[1]; 

    jwt.verify(token, process.env.ACCESS_TOKEN, function(error, decoded){
    if(error){
        return res.status(403).send({message: 'forbidden'});
    }
    req.decoded = decoded;
    next();
    })
}

async function run(){
    try{
        const phoneInfoCollection = client.db('resellService').collection('phoneInfo');
        const bookingCollection = client.db('resellService').collection('bookingInfo');
        const userCollection = client.db('resellService').collection('userInfo');
        const reportCollection = client.db('resellService').collection('report');

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

        app.get('/bookings', verifyJWT, async (req, res) =>{
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if(email !== decodedEmail){
                return res.status(403).send({message: 'forbidden'});
            }

            const query = {email: email};
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);
        })

        app.delete('/bookings/delete/:id', verifyJWT, async (req, res) =>{
            const decodedEmail = req.decoded.email;
            const query = {email: decodedEmail};
            const user = await userCollection.findOne(query);

            if(user?.userType !== "Admin" && user?.userType !== "Seller" && user?.userType !== "Buyer"){
                return res.status(403).send({message: 'forbidden'});
            }
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const result = await bookingCollection.deleteOne(filter);
            res.send(result);
        } )

        app.post('/phoneInfoCollection', async(req, res) =>{
            const added = req.body
            const result = await phoneInfoCollection.insertOne(added);
            res.send(result);
        })
        
        app.get('/allPhoneInfo', verifyJWT, async (req, res) =>{
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if(email !== decodedEmail){
                return res.status(403).send({message: 'forbidden'});
            }

            const query = {sellerEmail: email};
            const result = await phoneInfoCollection.find(query).toArray();
            res.send(result);
        })

        app.delete('/phones/delete/:id', verifyJWT, async (req, res) =>{
            const decodedEmail = req.decoded.email;
            const query = {email: decodedEmail};
            const user = await userCollection.findOne(query);

            if(user?.userType !== "Admin" && user?.userType !== "Seller"){
                return res.status(403).send({message: 'forbidden'});
            }
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const result = await phoneInfoCollection.deleteOne(filter);
            res.send(result);
        } )
        
        app.get('/jwt', async(req, res) =>{
            const email = req.query.email;
            const query = {email: email};
            const user = await userCollection.findOne(query)
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1h'})
                return res.send({accessToken: token});
            }
            res.status(403).send({access: 'forbidden'});
        })

        app.post('/users', async (req, res) =>{
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        } )

        app.post('/report', async (req, res) =>{
            const report = req.body;
            const result = await reportCollection.insertOne(report);
            res.send(result);
        } )

        app.get('/report', async (req, res) =>{
            const query = {};
            const result = await reportCollection.find(query).toArray();
            res.send(result);
        } )

        app.get('/users', async (req, res) =>{
            const query = {};
            const result = await userCollection.find(query).toArray();
            res.send(result);
        } )

        app.get('/users/admin/:email', async(req, res) =>{
            const email = req.params.email;
            const query = { email };
            const user = await userCollection.findOne(query);
            res.send({ isAdmin: user?.userType === 'Admin' })
        })

        app.get('/users/seller/:email', async(req, res) =>{
            const email = req.params.email;
            const query = { email };
            const user = await userCollection.findOne(query);
            res.send({ isSeller: user?.userType === 'Seller' })
        })

        app.get('/sellers', async (req, res) =>{
            const query = {userType: "Seller"};
            const result = await userCollection.find(query).toArray();
            res.send(result);
        } )

        app.delete('/users/delete/:id', verifyJWT, async (req, res) =>{
            const decodedEmail = req.decoded.email;
            const query = {email: decodedEmail};
            const user = await userCollection.findOne(query);

            if(user?.userType !== "Admin"){
                return res.status(403).send({message: 'forbidden'});
            }
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const result = await userCollection.deleteOne(filter);
            res.send(result);
        } )

        app.put('/seller/verify/:id', verifyJWT, async (req, res) =>{
            const decodedEmail = req.decoded.email;
            const query = {email: decodedEmail};
            const user = await userCollection.findOne(query);

            if(user?.userType !== "Admin"){
                return res.status(403).send({message: 'forbidden'});
            }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    verified: 'yes'
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc, options);
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