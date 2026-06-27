const mongoose = require('mongoose');

const pendingPaymentSchema = new mongoose.Schema({
    conversationId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60
    }
});

module.exports = mongoose.model('PendingPayment', pendingPaymentSchema);
