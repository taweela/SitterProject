const Payment = require('../models/Payment');
const verifyToken = require('../utils/verifyToken');

const router = require('express').Router();

router.get('/', verifyToken(['client', 'serviceProvider']), async (req, res) => {
    const query = {
        $or: [
            { client: req.user._id },
            { provider: req.user._id },
        ],
    }
    const payments = await Payment.find(query).select("-__v");
    return res.send({ payments: payments });
});

router.post('/create', verifyToken(['client', 'serviceProvider']), async (req, res) => {
    const { type, amount, provider, order } = req.body;
    const payment = new Payment({
        client: req.user._id,
        type: type,
        amount: amount,
        provider: provider,
        order: order
    });
    try {
        const savedPayment = await payment.save()

        return res.send({ payment: savedPayment, message: 'Payment Done successfully' });
    } catch (err) {
        return res.status(400).send(err);
    }
});

module.exports = router;