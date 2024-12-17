//setting up mongoose js
const mongoose = require('mongoose');

//connecting to MongoDB
mongoose.connect(process.env.MONGOURL).then(function(){
    console.log('Connected to MongoDB...');
})

module.exports = mongoose.connection;