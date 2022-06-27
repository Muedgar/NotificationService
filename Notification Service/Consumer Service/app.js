const express = require("express");
const bodyParser = require("body-parser");
const redis = require("redis");
const cors = require("cors");
const {fork} = require("child_process");

require("dotenv").config();

let client = redis.createClient();
// let startClient = async()=> {
//     await client.connect();
// }
// startClient();
client.on('connect', () => {
    console.log('Connected to Redis...');
});

const port = process.env.PORT;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));



app.get('/',async(req,res)=> {
   
    res.status(200).json({status: "connected to consumer server"});
});

// get data from producer service
app.post('/receiveNotification',async(req, res)=> {
    // Data to Queue for sending notifications
    let notificationMessageToQueue;
    let status = false;
    let data = req.body.data;
    // let newData = JSON.parse(data);
    let message = data['message'];
    let contacts = data['contacts'];
    client.hmset("notification", [
        'message', message,
        'contacts', JSON.stringify(contacts)
    ],function(err, reply) {
        if(err) {
            console.log(err);
        }
        console.log(reply);
    });
    client.hgetall("notification",function(err, obj){
        if(!obj) {
            console.log("no notification available");
        }else {
            let parsedObj = JSON.parse(obj['contacts']);
            

            notificationMessageToQueue = {
                message: obj['message'],
                contacts: parsedObj
            };
            status = true;
        }
    });

    if(status) {
        console.log(notificationMessageToQueue);
    }
    setTimeout(() => {
        console.log(notificationMessageToQueue);
        const mes = notificationMessageToQueue['message'];
        const cont = notificationMessageToQueue['contacts'];
        const childProcess = fork('./sender/sender.js');
        childProcess.send({"notification": {mes,data: JSON.stringify(cont)}});
        childProcess.on("message",message=> {
            console.log(message);
         });
    }, 1000);
    
});

app.listen(port,() => {
    console.log('Server started on port: '+port);
});