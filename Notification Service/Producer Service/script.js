const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const axios = require("axios");
require("dotenv").config();
const notificationModel = require("./model/notificationRequestModel");
const {ratelimiter} = require("./ratelimiter/ratelimiter");
const activeUser = require("./model/current.js");
const NotificationRepository = require("./model/repository/notificationMetaDataService");
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
const mongoURI = process.env.MONGO_URI;

let conn;
app.set('view engine', 'ejs');
app.use(express.static('public'));
let activeUs = "";
app.get('/', async (req,res)=> {
    const active =await activeUser.find({});
    activeUs = active[0].active;
    console.log(active[0].active);
    console.log(req.body);
    res.render('index');
});

/////////////////
app.get('/getTier', async(req, res) => {
    const token = req.cookies.jwt;

        // check json jwt exists & is verified
        if(token) {
        jwt.verify(token,'net ninja secret', (err, decodedToken) => {
            if(err) {
                console.log(err.message);
            }else {
               res.status(200).json({decodedToken});
            }
        });
    }
});
////////////////


app.get('/logout',async(req,res)=> {
    // delete currently logged in db.
    // clear database collection.
    await activeUser.deleteMany({});
    const active =await activeUser.find({});
    console.log(active);
    console.log("logging out");
   res.cookie('jwt',' ', {maxAge: 1});
    res.redirect('http://127.0.0.1:5000');
});
app.post('/load', async(req,res)=> {
    //save currently loggenin user in db
    const active = await activeUser.create(req.body);
    res.status(200).json(active);
});
app.post('/upload',ratelimiter,async(req,res)=> {
    console.log(req.cookies);
    const {message, contacts} = req.body;
    const active =await activeUser.find({});
   // console.log(active[0].active);
    try {
        console.log(`trying to store ${message}`);
        console.log(typeof message);
        console.log(typeof contacts);
       const noti = await notificationModel.create(req.body);
    // use axios to send a post request to the consumers service so that consumers can get messages and the payload will be req.body
    // this post request will call a sender which will implement sending messages
    const data = req.body;

        // const ans =  await fetch('http://127.0.0.1:3000/receiveNotification', {
        //     method: 'POST',
        //     mode: 'cors',
        //     body: JSON.stringify(data),
        //     headers: {'Content-Type': 'application/json'}
        // }).catch(console.error);
        console.log("data sent");
        res.status(200).json({status: "Notification Message Sent"});
       await axios.post('http://127.0.0.1:3000/receiveNotification', {
            data
        });

        
         
      
//     const notification = mongoose.model('notificationModel', { message: String });

// const result = await new notification({ message });
// await result.save().then(() => res.status(200).send({mes: "Successfully created record"}));
           
    } catch (error) {
        res.status(404).json({mes: "failed to record", err: error});
        
    }
});

app.get('/allNotifications',async (req,res) => {
    try {
        const data = await new NotificationRepository().getAllNotifications();
        res.status(200).json(data);
    } catch (error) {
        throw new Error(error);
    }
});
const startDB = async () => {
        conn =await mongoose.connect(mongoURI,{family:4},{ useNewUrlParser: true, useUnifiedTopology: true })
                    .then((result) => app.listen(process.env.PORT,'127.0.0.1',()=>console.log("connected and server running...")))
                    .catch((err) => console.log(err));
}
startDB();
