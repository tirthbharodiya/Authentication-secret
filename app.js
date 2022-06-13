//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const md5 = require("md5");
const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const saltRound = 10;
// const _ = require("lodash");
// const date = require(__dirname + "/date.js"); //date.js requiring local file
//date.getDate()  for use first function of date.js file
//date.getday() for use second function of date.js file

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret:"This is session",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});

const userSchema = new mongoose.Schema({
email:String,
password:String
})

userSchema.plugin(passportLocalMongoose);

// const secret = process.env.SECRET; //Using Env file authentication

// userSchema.plugin(encrypt,{secret : secret, encryptedFields : ["password"]}); //Plugin for encryption of password of schema.

const User = new mongoose.model("User",userSchema);

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
    bcrypt.hash(req.body.password,saltRound,function(err,hash){

    const email = req.body.username;
    // const pass = md5(req.body.password); //Used Hashing method (md5) to hash the password 
     const pass = hash; //   

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

    });
    

//for login route requests
app.route("/login")

.get(function(req,res){
    res.render("login");
})

.post((req,res)=>{
    const username = req.body.username;
    const pass = req.body.password;
    // const pass = md5(req.body.password); //Used Hashing method to compare with hashed password in database
   User.findOne({email:username},function(err,foundUser){
    
if(err){
        res.send(err);
    }else{
        if(foundUser){
            bcrypt.compare(pass , foundUser.password , function(err,result){
                console.log(err);
                console.log(result);
                if(result === true){
                    res.render("secrets");
                }
            });
        }
    }
});
});
// console.log(md5("hello"));
            

app.listen("3000",function(err){
    if(!err){
console.log("Server is litening on port 3000");
    }
});