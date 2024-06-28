const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const User = require('../models/User');
const verifyToken = require('../utils/verifyToken');

const router = require('express').Router();

router.get('/client', verifyToken(['client']), async (req, res) => {
    const payments = await Payment.find({ client: req.user._id }).select("-__v");
    const pendingOrders = await Order.countDocuments({ client: req.user._id, status: 'pending' });
    const acceptedOrders = await Order.countDocuments({ client: req.user._id, status: 'accepted' });
    const completedOrders = await Order.countDocuments({ client: req.user._id, status: 'completed' });
    return res.send({ payments: payments, pendingOrders: pendingOrders, acceptedOrders: acceptedOrders, completedOrders: completedOrders });
});

router.get('/provider', verifyToken(['serviceProvider']), async (req, res) => {
    const payments = await Payment.find({ provider: req.user._id }).select("-__v");
    const pendingOrders = await Order.countDocuments({ provider: req.user._id, status: 'pending' });
    const acceptedOrders = await Order.countDocuments({ provider: req.user._id, status: 'accepted' });
    const completedOrders = await Order.countDocuments({ provider: req.user._id, status: 'completed' });
    return res.send({ payments: payments, pendingOrders: pendingOrders, acceptedOrders: acceptedOrders, completedOrders: completedOrders });
});

router.get('/', verifyToken(['admin']), async (req, res) => {
    const orders = await Order.countDocuments();
    const users = await User.countDocuments();
    const reviews = await Review.countDocuments();
    return res.send({ orders: orders, users: users, reviews: reviews });
});

module.exports = router;