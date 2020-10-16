const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const newsletterSchema = new Schema({
    email: String,
  
},     { collection: 'newsletter' }
);

const Newsletter = mongoose.model('newsletter', newsletterSchema);

module.exports = Newsletter;

