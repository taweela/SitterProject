const Notification = require("../models/Notification");
const verifyToken = require("../utils/verifyToken");
const router = require('express').Router();
const { ObjectId } = require('mongodb');

router.get('/', verifyToken(['client', 'serviceProvider', 'admin']), async (req, res) => {
    
    const notifications = await Notification.find({ receiver: req.user._id, read: false }).populate({
        path: 'sender'
    }).populate({
        path: 'receiver'
    }).select("-__v");
    return res.send(notifications);
});

router.put('/read/:notificationId', verifyToken(['admin', 'client', 'serviceProvider']), async (req, res) => {
    const notificationId = new ObjectId(req.params.notificationId);

    const filterQuery = {
        _id: notificationId,
    };

    try {
        await Notification.updateMany(
            filterQuery,
            { $set: { read: true } }
        );

        return res.send({ message: 'Notification marked as read successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Internal Server Error' });
    }
});

module.exports = router;