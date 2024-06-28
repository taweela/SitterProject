const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    cardNumber: {
        type: String,
        required: true,
    },
    expirationDate: {
        type: String,
        required: true,
    },
    cvc: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
});

module.exports = mongoose.model('Card', cardSchema);
