const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
    orderId:{
        type:String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    products: [{
        productId:String,
        name: String, 
        quantity: Number,
        imageUrl:String,
        price: Number,
        isReturned: {
            type: Boolean,
            default: false
        },
        returnReason: {
            type: String,
        }
        
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['success', 'pending', 'failed'],
        default: 'pending'
    },
    trackingNumber: {
        type:String,
    }, 
    courier: {
        type: String,
    },
    isSalesContractAccepted: {
        type: Boolean,
        required: true 
    },
    isConfirmed: {
        type: Boolean,
        default: false // Onay durumu
    },
    isCancelled: {
        type: Boolean,
        default: false // İptal durumu
    },
    isDelivered:{
        type:Boolean,
        default:false
    },
    isReturned:{
        type:Boolean,
        default:false
    },
    returnReason: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
