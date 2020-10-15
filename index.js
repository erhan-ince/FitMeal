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

const fetch = require('node-fetch');

// Isabelle
require('dotenv').config()

// Isabelle

let maxCalories
let minProtein
let maxFat
let maxCarbs
let maxProtein
let query_eiweiss
let query_allergene
let query_typ
let query_eigenschaft

//


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
// app.get('/', (req, res) => {
//     fetch(
//          "https://api.spoonacular.com/recipes/complexSearch?type=type&apiKey=84fe766ead804aee905fa97fc4f9ead9"
//     )
//     .then((res) => res.json())
//     .then((json) => res.render('index', { APIData: json.results }));
// });
// app.get('/', (req, res) => {
//     fetch(
//          "https://api.spoonacular.com/recipes/complexSearch?type=type&apiKey=84fe766ead804aee905fa97fc4f9ead9"
//     )
//     .then((res) => res.json())
//     .then((json) => res.render('index', { APIData2: json.results }));
// });

// Isabelle

// app.get('/', (req, res) => {
//      fetch(`https://api.spoonacular.com/recipes/findByNutrients?maxCalories=${maxCalories}&minProtein=${minProtein}&maxFat=${maxFat}&maxCarbs=${maxCarbs}&maxProtein=${maxProtein}&number=10&apiKey=${process.env.apiKey}`)
//          .then(res => res.json())
//          .then(json => {
//               data = json;
//               console.log(data)
//           //     res.send(data)
//              res.status(200).render('index', {  })
//          })
//          .catch(err => console.log(err))
// })

// fetch(`https://api.spoonacular.com/food/search?query=${query_eiweiss} ${query_allergene} ${query_typ} ${query_eigenschaft}&number=2&apiKey=${process.env.apiKey}`)

app.get('/', (req, res) => {
     fetch(`https://api.spoonacular.com/food/search?query=chicken&number=2&apiKey=${process.env.apiKey}`)
         .then(res => res.json())
         .then(json => {
              data = json;
              console.log(data)
          //     res.send(data)
             res.status(200).render('index', {  })
         })
         .catch(err => console.log(err))
})
app.get('/products', (req, res) => {
     Meal.find()
          .then((result) => {
               res.render('products', { meals: result });
          })
          .catch((err) => console.log(err));
});


app.post("/filter", (req, res) => {
     console.log(req.body)
     if (req.body.ziel=="abnehmen") {
          maxCalories = 700
     } else {
          maxCalories=3000
     }
     if (req.body.ziel=="muskel") {
          minProtein = 25
     } else {
          minProtein = 0
     }
     if (req.body.ziel=="gesund") {
          maxFat = 5;
          maxCarbs = 30;
          maxProtein = 3;
          maxCalories = 1000
     } else {
          maxFat = 50;
          maxCarbs = 300;
          maxProtein = 50;
          maxCalories = 3000
     }
     query_eiweiss = req.body.eiweiss
     query_allergene = req.body.allergene
     query_typ = req.body.typ
     query_eigenschaft = req.body.eigenschaft
     

     console.log("maxCalories: " + maxCalories, "minProtein: " + minProtein, "maxFat: " + maxFat, "maxCarbs: " + maxCarbs, "maxProtein: " + maxProtein)
     console.log("eiweiss: " + query_eiweiss)
     console.log("allergene: " + query_allergene)
     console.log("typ: " + query_typ)
     console.log("eingenschaft: " + query_eigenschaft)


     res.redirect("/")
})

// min protein muskelaufbau: 30g
// max calories abnehmen: 700 cal
// protein cal carb fat gesund leben: fat max. 5g, carb max. 100g, protein max. 3g, cal max. 1000 cal

// diet parameter: vegan


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

 
