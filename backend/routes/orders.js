const Notification = require('../models/Notification');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const User = require('../models/User');
const { getBackendHourDifference } = require('../utils/utils');
const verifyToken = require('../utils/verifyToken');
const moment = require('moment');

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

router.get('/allOrders', verifyToken(['admin']), async (req, res) => {

    const statusFilter = req.query.status !== '' && typeof req.query.status !== 'undefined' ? { status: req.query.status } : { status: { $ne: 'deleted' } };
    const filterParams = {
        ...statusFilter,
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

router.get('/getOrderNumber/:orderNumber', verifyToken(['client', 'serviceProvider', 'admin']), async (req, res) => {
    const order = await Order.aggregate([
        { $match: { orderNumber: parseFloat(req.params.orderNumber) } },
        {
            $lookup: {
                from: "users",
                localField: "client",
                foreignField: "_id",
                as: "client"
            }
        },
        { $unwind: "$client" },
        {
            $lookup: {
                from: "users",
                localField: "provider",
                foreignField: "_id",
                as: "provider"
            }
        },
        { $unwind: "$provider" },
        {
            $lookup: {
                from: "payments", // Collection name for Payment model
                localField: "_id",
                foreignField: "order",
                as: "payments"
            }
        },
        {
            $project: {
                __v: 0,
            }
        }
    ])
    const reviewForOrder = await Review.findOne({ orderNumber: parseFloat(req.params.orderNumber), client: req.user._id });
    const reviewed = reviewForOrder ? true : false;
    if (!order[0]) {
        return res.status(400).send('No order found');
    }
    if (req.user.role == 'client') {
        return res.send({ ...order[0], reviewed })
    }
    return res.send(order[0]);
});

router.post('/create', verifyToken(['client']), async (req, res) => {
    const user = await User.findById({ _id: req.body.provider });
    const userFromDate = moment(user.fromDate); // Convert MongoDB Date field to Moment.js object
    const userToDate = moment(user.toDate);
    const requestBodyStart = moment(req.body.start, 'YYYY-MM-DD HH:mm');
    const requestBodyEnd = moment(req.body.end, 'YYYY-MM-DD HH:mm');

    if (userFromDate.isSameOrBefore(requestBodyStart) && !userToDate.isSameOrBefore(requestBodyEnd)) {
        const orderExists = await Order.findOne({
            $or: [
                { startDate: { $lte: req.body.start }, endDate: { $gte: req.body.start } },
                { startDate: { $lte: req.body.end }, endDate: { $gte: req.body.end } }
            ]
        }).populate({
            path: 'client'
        });
        if (orderExists) {
            return res.status(400).send({
                message: 'Order already exists, Please select other date',
                existingOrder: {
                    startDate: orderExists.startDate,
                    endDate: orderExists.endDate,
                    client: `${orderExists.client.firstName} ${orderExists.client.lastName}`
                }
            });
        }

        const order = new Order({
            client: req.user._id,
            provider: req.body.provider,
            type: req.body.type,
            entity: req.body.entity,
            startDate: req.body.start,
            endDate: req.body.end,
            description: req.body.description,
            title: req.body.title,
            status: 'pending',
        });
        const notification = new Notification({
            sender: req.user._id,
            receiver: req.body.provider,
            content: "New Order requested!",
            read: false,
            type: 'order'
        });
        try {
            const savedOrder = await order.save()
            await notification.save()
            return res.send({ order: savedOrder, message: 'Order successfully requested' });
        } catch (err) {
            return res.status(400).send(err);
        }
    } else {
        return res.status(400).send({ message: 'Please request in Provider schedule!' });
    }
});

router.put('/manageStatus/:id', verifyToken(['client', 'serviceProvider']), async (req, res) => {
    const updateValues = req.body;
    const orderData = await Order.findById(req.params.id);
    const notification = new Notification({
        sender: req.user._id,
        receiver: (updateValues.status == 'accepted' || updateValues.status == 'declined') ? orderData.client : orderData.provider,
        content: `Your order was ${updateValues.status}`,
        read: false,
        type: 'order'
    });
    const order = await Order.findOneAndUpdate({ _id: req.params.id }, updateValues, {
        new: true,
    });
    await notification.save();

    if (req.body.status == 'completed') {
        const orderData = await order.populate('provider');
        const payment = new Payment({
            client: orderData.client,
            type: 'hourly',
            amount: orderData.provider.rate * getBackendHourDifference(orderData.endDate, orderData.startDate),
            provider: orderData.provider._id,
            order: orderData._id
        });
        await payment.save();
    }
    return res.send({ message: 'Order Status successfully updated' });
});

router.delete('/delete/:id', verifyToken(['client']), async (req, res) => {
    await Order.deleteOne({ _id: req.params.id });
    return res.send({ message: 'Order successfully deleted!' });
});

module.exports = router;