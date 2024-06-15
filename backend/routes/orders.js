const mongoose = require('mongoose');
const Order = require('../models/Order');
const verifyToken = require('../utils/verifyToken');

const router = require('express').Router();

router.get('/', verifyToken(['client', 'serviceProvider']), async (req, res) => {

    const providerFilter = req.user && req.user.role == 'serviceProvider' ? { provider: req.user._id } : { client: req.user._id };
    const statusFilter = req.query.status !== '' && typeof req.query.status !== 'undefined' ? { status: req.query.status } : { status: { $ne: 'deleted' } };
    const filterParams = {
        ...statusFilter,
        ...providerFilter,
    };
    const totalCount = await Order.countDocuments({});
    const orders = await Order.find(filterParams).populate({
        path: 'client'
    }).populate({
        path: 'provider'
    }).select("-__v");
    return res.send({
        totalCount,
        orders,
        filteredCount: orders.length,
    });
});

router.post('/create', verifyToken(['client']), async (req, res) => {
    const { provider } = req.body;
    console.log(req.body)
    const order = new Order({
        client: req.user._id,
        provider: provider,
        status: 'pending',
    });
    try {
        const savedOrder = await order.save()

        return res.send({ order: savedOrder, message: 'Order successfully requested' });
    } catch (err) {
        return res.status(400).send(err);
    }
});

router.put('/manageStatus/:id', verifyToken(['client', 'serviceProvider']), async (req, res) => {
    const updateValues = req.body;
    await Order.findOneAndUpdate({ _id: req.params.id }, updateValues, {
        new: true,
    });
    return res.send({ message: 'Order Status successfully updated' });
});

router.delete('/delete/:id', verifyToken(['client']), async (req, res) => {
    await Order.deleteOne({ _id: req.params.id });
    return res.send({ message: 'Order successfully deleted!' });
});

module.exports = router;