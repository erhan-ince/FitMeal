const mongoose = require('mongoose');

const Schema = mongoose.Schema;
// const Payment = new Schema ({
//     payer: [] 
// })
const paypalSchema = new Schema({
    id: String,
    intent: String,
    state: String,
    email: String,
    cart: String,
    payer: Object,
    transactions: Object,
    shipping_address: Object,
  
},     { collection: 'paypal' }
);

const Paypal = mongoose.model('paypal', paypalSchema);

module.exports = Paypal;

