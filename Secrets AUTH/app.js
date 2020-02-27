// using variable
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require ('ejs');
const chalk = require('chalk');
const morgan = require('morgan');
const PORT = process.env.PORT || 3000 ;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.set('view engine','ejs');
app.use(morgan('tiny'));
app.use(express.static("public"));
app.use(session({
    secret : 'Our little secret.',
    resave : false,
    saveUninitialized : false,

}));
app.use(passport.initialize());
app.use(passport.session());

// creting a mongodb
        mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser : true, useUnifiedTopology: true});
        //confirming the connection
        mongoose.connection.once('open',()=> console.log(chalk.bgCyan('mongodb is connected ...')));
        mongoose.set('useCreateIndex',true);

        const userSchema = new mongoose.Schema({
            email : String,
            password : String
        });

        userSchema.plugin(passportLocalMongoose);

                // encryption of data sent to DB 
                // use varriable 

                
              


        const User = new mongoose.model('User', userSchema);
        passport.use(User.createStrategy());
        passport.serializeUser(User.serializeUser());
        passport.deserializeUser(User.deserializeUser());




//chaining routes 
app.get('/',(req,res)=>{
    res.render('home');
});

app.get('/login',(req,res)=>{
    res.render('login');
});

app.get('/register',(req,res)=>{
    res.render('register');
});

app.get('/logout',(req,res)=>{
    req.logout();
    req.redirect('/')
})


app.get('/secrets', (req,res)=>{
    if(req.isAuthenticated()){
        res.render('secrets');
    }else{
        res.redirect('login');
    }
    })

// capture the email and password
app.post('/register',(req,res)=>{

    User.register({username : req.body.username},req.body.password, (err,user)=>{
        if (err){
            console.log(err);
            res.redirect('/register');
        }else{
            passport.authenticate('local')(req,res, ()=>{
                res.redirect('/secrets');
            });
        }
    });

});

// login post 
app.post('/login', (req,res)=>{
    const user = new User({
        username :req.body.username,
        password :req.body.password
    });

    req.login(user, (err)=>{
        if(err){
            console.log(err)
        }else{
            passport.authenticate('local')(req,res, ()=>{
                res.redirect('/secrets');
            });
        }
    })
    
})-


app.listen(PORT, ()=>console.log(chalk.bgCyan(`server running on port ${PORT} ...`)));