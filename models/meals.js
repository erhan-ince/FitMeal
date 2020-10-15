const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const mealSchema = new Schema({
    id: String,
    title: String,
    image: String,
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number,
    price: Number,
    category: String, // Huhn, Rind, Vegan, Fisch
    allergene: String, // glutenfrei, laktosefrei, ohen Nüsse
    type: String, // Snack oder Gericht
    properties: String, //low carb, high protein, high carb
  
},     { collection: 'meals' }
);

const Meal = mongoose.model('meals', mealSchema);

module.exports = Meal;

// min protein muskelaufbau: 30g
// max calories abnehmen: 700 cal
// protein cal carb fat gesund leben: fat max. 5g, carb max. 100g, protein max. 50g, cal max. 1000 cal

// low carb: max. 30g
// high protein: min. 30g
// high carb: min. 150g