const express = require('express');
const authRoutes = require('./routes/authRoutes');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
require('./config/passport-setup');
const passport = require('passport');
const app = express();
const profileRoutes = require('./routes/profileRoutes');
const keys = require('./config/keys')
const Meal = require('./models/meals');
const Newsletter = require('./models/newsletter');

const fetch = require('node-fetch');

// Isabelle
require('dotenv').config()

// Isabelle

let gender
let age
let size
let weight
let activity
let training
let rate
let need
let carbs
let protein
let fat


//


mongoose
     .connect(keys.mongodb.dbURI, { useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify:false })
     .then((result) => {
          console.log('db connected');
          app.listen(3001, () => {
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
     res.status(200).render('index')
})

app.get('/products', (req, res) => {
     Meal.find()
          .then((result) => {
               res.render('products', { meals: result });
          })
          .catch((err) => console.log(err));
});

// Filter-----------------------------

app.post("/filter", (req, res) => {
     console.log(req.body)

     console.log("Kategorie: " + req.body.category)
     console.log("Allergene: " + req.body.allergene)
     console.log("Typ: " + req.body.type)
     console.log("Eingenschaft: " + req.body.properties)


     res.redirect(`/filter/${req.body.category}/${req.body.allergene}/${req.body.type}/${req.body.properties}`)
})

app.get('/filter/:id1/:id2/:id3/:id4', (req, res) => {
     // console.log(`search query ` + req.params)
     // res.send(req.params)
     if (req.params.id2 == "keine Allergene") {
          Meal.find({
               category: req.params.id1,
               type: req.params.id3,
               properties: req.params.id4
          })
               .then(result => {
                    console.log(result)
                    res.status(200).render('results', {meals: result})
               })
               .catch(err => console.log(err))
          
     } else  {
          Meal.find({
               category: req.params.id1,
               allergene: req.params.id2,
               type: req.params.id3,
               properties: req.params.id4
          })
               .then(result => {
                    console.log(result)
                    res.status(200).render('results', {meals: result})
               })
               .catch(err => console.log(err))
     }
     // Meal.find({
     //      category: req.params.id1,
     //      allergene: req.params.id2,
     //      type: req.params.id3,
     //      properties: req.params.id4
     // })
     //      .then(result => {
     //           console.log(result)
     //           res.status(200).render('results', {meals: result})
     //      })
     //      .catch(err => console.log(err))

 })


// Kalorienrechner---------------------

app.post('/rechner', (req, res) => {
     console.log(req.body)
     gender = req.body.gender
     age = req.body.age
     size = req.body.size
     weight = req.body.weight
     activity = req.body.activity
     training = req.body.training
     
     res.status(200).redirect('/kalorienrechner')
})

app.get('/kalorienbedarf', (req, res) => {
     res.status(200).render('kalorienbedarf', {})
})


app.get('/kalorienrechner', (req, res) => {
     if (gender == "weiblich") {
          rate = ((Number(weight) * 10) + (Number(size) * 6.25) - (Number(age) * 5) - 161).toFixed()
     } else {
          rate = ((Number(weight) * 10) + (Number(size) * 6.25) - (Number(age) * 5) + 5).toFixed()
     }
     need = (Number(rate) * Number(activity)).toFixed()
     if (training=="abnehmen") {
          need = need - 300
     } else if (training=="muskelaufbau") {
          need = need + 300
     }
     else {
          need = need
     }
     carbs = (need * 0.5 / 4).toFixed()
     protein = (need * 0.25 / 4).toFixed()
     fat = (need * 0.25 / 9).toFixed()
     
     console.log(rate, need, carbs, protein, fat)
     res.status(200).render('kalorienrechner', {rate, need, carbs, protein, fat, gender, age, size, weight, activity, training})
})

//Form-----------------------------
app.get('/form', (req, res) => {
     res.render('form');
});

app.post('/newData', (req, res) => {
     const newMeal = new Meal({
          title: req.body.title,
          image: req.body.image,
          calories: req.body.calories,
          protein: req.body.protein,
          fat: req.body.fat,
          carbs: req.body.carbs,
          price: req.body.price,
          category: req.body.category,
          allergene: req.body.allergene,
          type: req.body.type,
          properties: req.body.properties,
     });
     newMeal
          .save()
          .then((result) => {
               console.log('new food saved');
               res.redirect('./form');
          })
          .catch((err) => console.log(err));
});


// ----------------------Newsletter---------------------
app.post('/newsletter', (req, res) => {
     const newNewsletter = new Newsletter({
          email: req.body.email,
     });
     newNewsletter
          .save()
          .then((result) => {
               console.log('new mail saved');
               res.redirect('./');
          })
          .catch((err) => console.log(err));
});



