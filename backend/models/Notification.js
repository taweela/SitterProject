const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    type: {
        type: String,
        required: true,
    },
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
});

module.exports = mongoose.model('Notification', notificationSchema);
