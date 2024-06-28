const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['fixed', 'hourly'],
        default: '',
    },
    amount: {
        type: String,
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
});

module.exports = mongoose.model('Payment', paymentSchema);
