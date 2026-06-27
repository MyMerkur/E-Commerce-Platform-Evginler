const mongoose = require('mongoose');
const shortid = require('shortid');

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    surname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    cart: {
        type: Array,
        default: [],
    },
    cartId: {
        type: String,
        default: shortid.generate
    },
    addresses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    }],
    selectedAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]

});


userSchema.pre('save', function(next) {
    if (this.cart.length === 0) {
        this.cartId = shortid.generate();
    }
    
    next();
});


module.exports = mongoose.model('User',userSchema);