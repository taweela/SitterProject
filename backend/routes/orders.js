const Notification = require('../models/Notification');
const Order = require('../models/Order');
const Service = require('../models/Service');
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

router.get('/getOrderNumber/:orderNumber', verifyToken(['client', 'serviceProvider']), async (req, res) => {
    const order = await Order.aggregate([
        { $match: { orderNumber: parseFloat(req.params.orderNumber)} },
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
    if (!order[0]) {
        return res.status(400).send('No order found');
    }
    return res.send(order[0]);
});

router.post('/create', verifyToken(['client']), async (req, res) => {
    const { provider, service } = req.body;
    console.log(req.body)
    const serviceData = await Service.findById(service);
    console.log(serviceData.fromDate, serviceData.fromTime, serviceData.toDate, serviceData.toTime)
    const orderExists = await Order.findOne({ service: service });
    if (orderExists) { return res.status(400).send({ message: 'Order already exists' }); }

    const order = new Order({
        client: req.user._id,
        provider: provider,
        service: service,
        status: 'pending',
    });
    const notification = new Notification({
        sender: req.user._id,
        receiver: provider,
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
    await Order.findOneAndUpdate({ _id: req.params.id }, updateValues, {
        new: true,
    });
    await notification.save()
    return res.send({ message: 'Order Status successfully updated' });
});

router.delete('/delete/:id', verifyToken(['client']), async (req, res) => {
    await Order.deleteOne({ _id: req.params.id });
    return res.send({ message: 'Order successfully deleted!' });
});

module.exports = router;