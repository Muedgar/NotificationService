const express = require("express");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const User = require("./models/User");

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('views'));
app.use(cors());
app.use(bodyParser.json());
app.get('/',(req,res)=>{
    res.render('index');
});

app.get('/oneUserInformation/:id',async(req,res)=> {
    // get user info and attach it to the result.
    try {
        const id = req.params.id;
        let users = await User.find({});
        let user = {};
        for(let i=0;i<users.length;i++) {
            if(users[i]._id==id) {
                console.log("matched");
                user = users[i];
            }
        }
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(401).json({status: "failed to retrieve one user"});
    }
});
app.use(authRoutes);

const PORT = process.env.PORT;
const MONGO = process.env.MONGO_URI;

const startApp =async (P,M) => {
    
       try {
           let conn =await mongoose.connect(M,{family:4},{ useNewUrlParser: true, useUnifiedTopology: true })
                    .then((result) => app.listen(P,'127.0.0.1',()=>console.log("connected and server running...")))
                    .catch((err) => console.log(err));
       } catch (error) {
           
       }
}

startApp(PORT,MONGO);