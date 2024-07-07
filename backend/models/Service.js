const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['fixed', 'hourly'],
        required: true,
    },
    address: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'disabled', 'deleted', ''],
        default: 'active',
    },
    price: {
        type: Number,
        default: 0,
    },
    fromDate: {
        type: Date,
        required: true,
    },
    fromTime: {
        type: String,
        required: true,
    },
    toDate: {
        type: Date,
        required: true,
    },
    toTime: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    favourite: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }]
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
});

module.exports = mongoose.model('Service', serviceSchema);
