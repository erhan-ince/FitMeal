const express = require('express');
const authRoutes = require('./routes/authRoutes');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
require('./config/passport-setup');
const passport = require('passport');
const app = express();
const profileRoutes = require('./routes/profileRoutes');
const keys = require('./config/keys')

const fetch = require('node-fetch');

mongoose
     .connect(keys.mongodb.dbURI, { useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify:false })
     .then((result) => {
          console.log('db connected');
          app.listen(3000, () => {
               console.log('listening at 3000');
          });
     })
     .catch((err) => console.log(err));
     app.use(
        cookieSession({
             name: 'session',
             maxAge: 24 * 60 * 60 * 1000,
             keys: [keys.session.cookieKey]
        })
   );
   
app.use(express.static('public'));
//view engine
app.set('view engine', 'ejs');

//Middleware

//Same as Body-parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.get('/', (req, res) => {
    fetch(
         "https://api.spoonacular.com/recipes/complexSearch?type=type&apiKey=84fe766ead804aee905fa97fc4f9ead9"
    )
    .then((res) => res.json())
    .then((json) => res.render('index', { APIData: json.results }));
});
app.get('/', (req, res) => {
    fetch(
         "https://api.spoonacular.com/recipes/complexSearch?type=type&apiKey=84fe766ead804aee905fa97fc4f9ead9"
    )
    .then((res) => res.json())
    .then((json) => res.render('index', { APIData2: json.results }));
});
