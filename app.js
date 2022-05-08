//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption")
// const _ = require("lodash");
// const date = require(__dirname + "/date.js"); //date.js requiring local file
//date.getDate()  for use first function of date.js file
//date.getday() for use second function of date.js file

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});

const userSchema = new mongoose.Schema({
email:String,
password:String
})

const secret = process.env.SECRET;
userSchema.plugin(encrypt,{secret : secret, encryptedFields : ["password"]});

const User = new mongoose.model("User",userSchema);


//For route requests
app.route("/")

.get(function(req,res){
    res.render("home");
});

//for register route requests
app.route("/register")

.get(function(req,res){
    res.render("register");
})

.post(function(req,res){
    const email = req.body.username;
    const pass = req.body.password;

const newUser = new User({
email:email,
password:pass
});

newUser.save(function(err){
    if(!err){
        res.render("secrets");
    }else{
        res.send(err);
    }
});
});

//for login route requests
app.route("/login")

.get(function(req,res){
    res.render("login");
})

.post((req,res)=>{
    const username = req.body.username;
    const pass = req.body.password;
   User.findOne({email:username},function(err,foundUser){
    
if(err){
        res.send(err)
    }else{
        if(foundUser){
            if(foundUser.password === pass){
                res.render("secrets");
            }
        }
    }
   });
});

app.listen("3000",function(err){
    if(!err){
console.log("Server is litening on port 3000");
    }
});