const mongoose = require('mongoose');

brandsSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model('Brand',brandsSchema);