const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const orderSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'completed', 'canceled'],
        default: 'pending',
    },

}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
});

orderSchema.plugin(AutoIncrement, { inc_field: 'orderNumber', start_seq: 1000 });

module.exports = mongoose.model('Order', orderSchema);
