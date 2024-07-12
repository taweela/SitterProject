const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    description: {
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
    marks: {
        type: Number,
        required: true
    },
    orderNumber: {
        type: Number,
        unique: true,
        required: true,
    },
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
});

module.exports = mongoose.model('Review', reviewSchema);
