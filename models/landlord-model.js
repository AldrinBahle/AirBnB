const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new  mongoose.Schema({

    location: {
        type: String,
    },
    price:{
        type:String
    },

    body:{
        type: String
    },
    status:{
        type: String,
        default: 'public'
    },
   
    image:[{
        imagePoster:{
            type: String
        },
        imageDate:{
            type: Date,
            default: Date.now
        },
        imageUser:{
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    }],
    user:{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
})

const Rooms =  mongoose.model('house', roomSchema);
module.exports = Rooms;
 