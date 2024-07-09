const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const orderSchema = new mongoose.Schema({
    title: {
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
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    description: {
        type: String,
    },
    entity: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'entityModel',
    },
    entityModel: {
        type: String,
        enum: ['Baby', 'Dog', 'House'],
      },
    type: {
        type: String,
        enum: ['baby', 'dog', 'house', ''],
        default: '',
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
