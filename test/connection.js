const mongoose = require('mongoose');
const keys = require('../config/keys');
//ES6 promise 
mongoose.Promise = global.Promise;


   const connect =  mongoose.connect(keys.mongodb.dbURI, { useNewUrlParser: true } );
    mongoose.connection.once('open', function(){
        console.log('Database has been Connected');
        // done();
    }).on('error',function(error){
        console.log('Check Database Connection', error);
    });

module.exports = connect;

 
