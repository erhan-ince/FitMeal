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

let maxCalories
let minProtein
let maxFat
let maxCarbs
let maxProtein
let query_eiweiss
let query_allergene
let query_typ
let query_eigenschaft


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

// app.get('/', (req, res) => {
//      fetch(`https://api.spoonacular.com/food/search?query=chicken&number=2&apiKey=${process.env.apiKey}`)
//          .then(res => res.json())
//          .then(json => {
//               data = json;
//               console.log(data)
//           //     res.send(data)
//              res.status(200).render('index', {  })
//          })
//          .catch(err => console.log(err))
// })

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


app.post("/filter", (req, res) => {
     console.log(req.body)
     if (req.body.ziel=="abnehmen") {
          maxCalories = 700
     } else {
          maxCalories=3000
     }
     if (req.body.ziel=="muskel") {
          minProtein = 30
     } else {
          minProtein = 0
     }
     if (req.body.ziel=="gesund") {
          maxFat = 5;
          maxCarbs = 100;
          maxProtein = 5;
          maxCalories = 1000
     } else {
          maxFat = 50;
          maxCarbs = 300;
          maxProtein = 50;
          maxCalories = 3000
     }
     query_category = req.body.category
     query_allergene = req.body.allergene
     query_typ = req.body.typ
     query_eigenschaft = req.body.eigenschaft
     
     console.log("maxCalories: " + maxCalories, "minProtein: " + minProtein, "maxFat: " + maxFat, "maxCarbs: " + maxCarbs, "maxProtein: " + maxProtein)
     console.log("eiweiss: " + query_category)
     console.log("allergene: " + query_allergene)
     console.log("typ: " + query_typ)
     console.log("eingenschaft: " + query_eigenschaft)


     res.redirect(`/filter/${req.body.ziel}/${req.body.category}/${req.body.allergene}/${req.body.typ}/${req.body.eigenschaft}`)
})

app.get('/filter/:id1/:id2/:id3/:id4/:id5', (req, res) => {
     console.log(`search query ` + req.params)
     res.send(req.params)
     if (req.params.id1 == "abnehmen") {
          Meal.find({
               calories: { $lte: 700 },
               category: "req.params.id2",
               allergene: "req.params.id3",
               type: "req.params.id4",
               properties: "req.params.id5"
          })
          .then(result => {
               console.log(result)
               res.send(result)
          })
          .catch(err => console.log(err))
     } else {
          console.log(test)
          // Meal.find({ calories: { $gt: 700 } })
          // .then(result => {
          //      console.log(result)
          //      res.send(result)
          // })
          // .catch(err => console.log(err))
     }
 
     // companyProfile.find({ company_name: { $regex: new RegExp(req.params.id, 'i') } })
     //     .then(result => {
     //         res.render('companyProfileList', { profileData: result })
     //     })
     //     .catch(err => console.log(err))
 })

// min protein muskelaufbau: 30g
// max calories abnehmen: 700 cal
// protein cal carb fat gesund leben: fat max. 5g, carb max. 100g, protein max. 5g, cal max. 1000 cal

// diet parameter: vegan

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



