const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    password: {
        type: String,
        required: true,
        max: 1024,
        min: 6,
    },
    role: {
        type: String,
        enum: ['admin', 'client', 'serviceProvider'],
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
    providerType: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'declined', 'deleted', ''],
        default: '',
    },
    rate: {
        type: Number,
        default: 100,
    },
    description: {
        type: String,
        default: '',
    },
    avatar: {
        type: String,
        default: '',
    },
    experience: {
        type: String,
    },
    age: {
        type: Number,
        required: false,
    },
    fromDate: {
        type: Date,
    },
    toDate: {
        type: Date,
    },
    favourite: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    lastLogin: {
        type: Date,
    },
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
});

module.exports = mongoose.model('User', userSchema);
