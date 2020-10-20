const express = require('express');
const authRoutes = require('./routes/authRoutes');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
require('./config/passport-setup');
const passport = require('passport');
const app = express();
const profileRoutes = require('./routes/profileRoutes');
const keys = require('./config/keys');
const Meal = require('./models/meals');
const Newsletter = require('./models/newsletter');
const PORT = process.env.PORT || 3000
const paypal = require('paypal-rest-sdk');

const fetch = require('node-fetch');

// Isabelle
require('dotenv').config();

// Isabelle

let gender;
let age;
let size;
let weight;
let activity;
let training;
let rate;
let need;
let carbs;
let protein;
let fat;

//

mongoose
     .connect(keys.mongodb.dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
     .then((result) => {
          console.log('db connected');
          app.listen(PORT, () => {
               console.log('listening at 3000');
          });
     })
     .catch((err) => console.log(err));
app.use(
   cookieSession({
      name: 'session',
      maxAge: 24 * 60 * 60 * 1000,
      keys: [keys.session.cookieKey],
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
   res.status(200).render('index');
});

app.get('/products', (req, res) => {
   Meal.find()
      .then((result) => {
         res.render('products', { meals: result, index: 1 });
      })
      .catch((err) => console.log(err));
});
// Paypal
paypal.configure({
   mode: 'sandbox', //sandbox or live
   client_id: keys.paypal.client_id,
   client_secret: keys.paypal.client_secret,
});

// Pay------------------------------------------------------
app.post('/pay/:id', (req, res) => {
   console.log(req.params.id);
   Meal.findById(req.params.id).then((result) => {
      console.log(result);
      if (typeof localStorage === "undefined" || localStorage === null) {
         var LocalStorage = require('node-localstorage').LocalStorage;
         localStorage = new LocalStorage('./scratch');
       }
        
       
      const create_payment_json = {
         intent: 'sale',
         payer: {
            payment_method: 'paypal',
         },
         redirect_urls: {
            return_url: 'http://localhost:3000/success/',
            cancel_url: 'http://localhost:3000/cancel',
         },
         transactions: [
            {
               item_list: {
                  items: [
                     {
                        name: result.title,
                        sku: 'item',
                        price: result.price,
                        currency: 'EUR',
                        quantity: 1,
                     },
                  ],
               },
               amount: {
                  currency: 'EUR',
                  total: result.price,
               },
               description: 'This is the payment description.',
            },
         ],
      };
      localStorage.setItem('myAmount', result.price);
       console.log(localStorage.getItem('myAmount'));
      paypal.payment.create(create_payment_json, function (error, payment) {
         if (error) {
            throw error;
         } else {
            for (let i = 0; i < payment.links.length; i++) {
               if (payment.links[i].rel === 'approval_url') {
                  res.redirect(payment.links[i].href);
               }
            }
         }
      });
   });
});
app.get('/success', (req, res) => {
   console.log(req)
   const payerId = req.query.PayerID;
   const paymentId = req.query.paymentId;

   const execute_payment_json = {
      payer_id: payerId,
      transactions: [
         {
            amount: {
               currency: 'EUR',
               total: localStorage.getItem('myAmount'),

            },
         },
      ],
   };
   paypal.payment.execute(paymentId, execute_payment_json, function (
      error,
      payment
   ) {
      if (error) {
         console.log(error.response);
         throw error;
      } else {
         console.log(JSON.stringify(payment));
         res.send('succes');
      }
   });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));



//Paypal2----------------------------
// Pay------------------------------------------------------
app.post('/pay1/:id', (req, res) => {
   console.log(req.params.id);
      const create_payment_json = {
         intent: 'sale',
         payer: {
            payment_method: 'paypal',
         },
         redirect_urls: {
            return_url: 'http://localhost:3000/succes',
            cancel_url: 'http://localhost:3000/cancel',
         },
         transactions: [
            {
               item_list: {
                  items: [
                     {
                        name: "title",
                        sku: 'item',
                        price: 49.99,
                        currency: 'EUR',
                        quantity: 1,
                     },
                  ],
               },
               amount: {
                  currency: 'EUR',
                  total: 49.99,
               },
               description: 'This is the payment description.',
            },
         ],
      };
      paypal.payment.create(create_payment_json, function (error, payment) {
         if (error) {
            throw error;
         } else {
            for (let i = 0; i < payment.links.length; i++) {
               if (payment.links[i].rel === 'approval_url') {
                  res.redirect(payment.links[i].href);
               }
            }
         }
      });
   });

app.get('/succes', (req, res) => {
   const payerId = req.query.PayerID;
   const paymentId = req.query.paymentId;

   const execute_payment_json = {
      payer_id: payerId,
      transactions: [
         {
            amount: {
               currency: 'EUR',
               total: 49.99,
            },
         },
      ],
   };
   paypal.payment.execute(paymentId, execute_payment_json, function (
      error,
      payment
   ) {
      if (error) {
         console.log(error.response);
         throw error;
      } else {
         console.log(JSON.stringify(payment));
         res.send('success');
      }
   });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));


// Filter-----------------------------

app.post('/filter', (req, res) => {
   console.log(req.body);

   console.log('Kategorie: ' + req.body.category);
   console.log('Allergene: ' + req.body.allergene);
   console.log('Typ: ' + req.body.type);
   console.log('Eingenschaft: ' + req.body.properties);

   res.redirect(
      `/filter/${req.body.category}/${req.body.allergene}/${req.body.type}/${req.body.properties}`
   );
});

app.get('/filter/:id1/:id2/:id3/:id4', (req, res) => {
   // console.log(`search query ` + req.params)
   // res.send(req.params)
   if (req.params.id2 == 'keine Allergene') {
      Meal.find({
         category: req.params.id1,
         type: req.params.id3,
         properties: req.params.id4,
      })
         .then((result) => {
            console.log(result);
            res.status(200).render('results', { meals: result });
         })
         .catch((err) => console.log(err));
   } else {
      Meal.find({
         category: req.params.id1,
         allergene: req.params.id2,
         type: req.params.id3,
         properties: req.params.id4,
      })
         .then((result) => {
            console.log(result);
            res.status(200).render('results', { meals: result });
         })
         .catch((err) => console.log(err));
   }
});

// random dish-----------

app.get("/random", (req, res) => {
     Meal.aggregate([{ $sample: { size: 3 } }])
          .then(result => {
               res.status(200).render('random', { meals: result })
          })
          .catch(err => console.log(err))
})


// Kalorienrechner---------------------

app.post('/rechner', (req, res) => {
   console.log(req.body);
   gender = req.body.gender;
   age = req.body.age;
   size = req.body.size;
   weight = req.body.weight;
   activity = req.body.activity;
   training = req.body.training;

   res.status(200).redirect('/kalorienrechner');
});

app.get('/kalorienbedarf', (req, res) => {
   res.status(200).render('kalorienbedarf');
});

app.get('/kalorienrechner', (req, res) => {
   if (gender == 'weiblich') {
      rate = (
         Number(weight) * 10 +
         Number(size) * 6.25 -
         Number(age) * 5 -
         161
      ).toFixed();
   } else if (gender == 'männlich') {
      rate = (
         Number(weight) * 10 +
         Number(size) * 6.25 -
         Number(age) * 5 +
         5
      ).toFixed();
   } else {
      rate = 0;
   }
   need = (Number(rate) * Number(activity)).toFixed();
   if (training == 'abnehmen') {
      need = Number(need) - 300;
      if (activity == 1.9) {
         carbs = ((need * 0.65) / 4).toFixed();
         protein = ((need * 0.15) / 4).toFixed();
         fat = ((need * 0.2) / 9).toFixed();
      } else {
         carbs = ((need * 0.5) / 4).toFixed();
         protein = ((need * 0.2) / 4).toFixed();
         fat = ((need * 0.3) / 9).toFixed();
      }
   } else if (training == 'muskelaufbau') {
      need = Number(need) + 300;
      if (activity == 1.9) {
         carbs = ((Number(need) * 0.65) / 4).toFixed();
         protein = (
            1.5 * Number(weight) +
            (Number(need - 300) * 0.15) / 4
         ).toFixed();
         fat = ((Number(need) * 0.2) / 9).toFixed();
      } else {
         carbs = ((Number(need) * 0.5) / 4).toFixed();
         protein = (
            1.5 * Number(weight) +
            (Number(need - 300) * 0.2) / 4
         ).toFixed();
         fat = ((Number(need) * 0.3) / 9).toFixed();
      }
   } else {
      need = need;
      if (activity == 1.9) {
         carbs = ((Number(need) * 0.65) / 4).toFixed();
         protein = ((Number(need) * 0.15) / 4).toFixed();
         fat = ((Number(need) * 0.2) / 9).toFixed();
      } else {
         carbs = ((Number(need) * 0.5) / 4).toFixed();
         protein = ((Number(need) * 0.2) / 4).toFixed();
         fat = ((Number(need) * 0.3) / 9).toFixed();
      }
   }

   console.log(rate, need, carbs, protein, fat);
   res.status(200).render('kalorienrechner', {
      rate,
      need,
      carbs,
      protein,
      fat,
      gender,
      age,
      size,
      weight,
      activity,
      training,
   });
});

// carbs = (need * 0.5 / 4).toFixed()
// protein = (need * 0.20 / 4).toFixed()
// fat = (need * 0.30 / 9).toFixed()

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
   console.log(newNewsletter);
   newNewsletter
      .save()
      .then((result) => {
         console.log('new mail saved');
         res.redirect('./');
      })
      .catch((err) => console.log(err));
});
// app.get('/success',  (req, res) => {
//    res.render('success', { user: req.user });
// });
