const router = require('express').Router();
const User = require("../models/User");
const verifyToken = require('../utils/verifyToken');
const mongoose = require('mongoose');
const multer = require("multer");
const path = require("path");
const { getDistanceBetween } = require('../utils/utils');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/img/profiles")
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storage
})

router.get('/personal/me', verifyToken(['admin', 'client', 'serviceProvider']), async (req, res) => {
    const user = await User.findById(req.user._id).select('-password -__v');

    return res.send({ user: user })
});

router.get('/', verifyToken(['admin', 'client']), async (req, res) => {
    const roleFilter = req.query.role !== '' && typeof req.query.role !== 'undefined' ? { role: req.query.role } : {};
    const statusFilter = req.query.status !== '' && typeof req.query.status !== 'undefined' ? { status: req.query.status } : {};
    const searchQuery = typeof req.query.q !== 'undefined' ? req.query.q : '';
    const filterParams = {
        $and: [
            {
                $or: [
                    { firstName: { $regex: searchQuery, $options: 'i' } },
                    { lastName: { $regex: searchQuery, $options: 'i' } },
                    { email: { $regex: searchQuery, $options: 'i' } },
                ],
            },
            roleFilter,
            statusFilter
        ],
    };
    const totalCount = await User.countDocuments({});
    const users = await User.find(filterParams).select('-password -__v');

    return res.send({
        totalCount,
        users,
        filteredCount: users.length,
    })
});

router.get('/serviceProvider', verifyToken(['admin', 'client']), async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const statusFilter = (req.query.status !== '' && req.query.status !== 'undefined')
        ? { status: req.query.status }
        : {};
    const searchQuery = typeof req.query.q !== 'undefined' ? req.query.q : '';
    const user = await User.findById(req.user._id).select('-password -__v');
    console.log(typeof req.query.price, req.query.price)
    const rateFilter = req.query.price && req.query.price !== 'null'
        ? {
            rate: {
                $gte: parseInt(req.query.price.split('-')[0]),
                $lte: parseInt(req.query.price.split('-')[1])
            }
        }
        : {};

    const providerFilter = req.query.selectedTypes ? { providerType: { $in: req.query.selectedTypes.split(',') } } : {}
    const latitude = user.latitude;
    const longitude = user.longitude;

    let minDistance;
    let maxDistance;
    if (req.query.distance && (!req.query.distance.includes('null') || req.query.distance !== 'allDistance')) {
        const distanceRange = req.query.distance?.split('-');
        minDistance = distanceRange[0];
        maxDistance = distanceRange[1];
    }
    const roleFilter = { role: 'serviceProvider' };

    const filterParams = {
        $and: [
            {
                $or: [
                    { firstName: { $regex: searchQuery, $options: 'i' } },
                    { lastName: { $regex: searchQuery, $options: 'i' } },
                    { email: { $regex: searchQuery, $options: 'i' } },
                ],
            },
            statusFilter,
            roleFilter,
            rateFilter,
            providerFilter,
        ],
    };

    const users = await User.find(filterParams).select('-password -__v').skip(skip).limit(limit);

    let providersWithDistance = users
        .filter(user => user.address) // Filter out users without an address
        .map(user => {
            const distance = getDistanceBetween(latitude, longitude, user.latitude, user.longitude).toFixed(2);
            return { distance, user };
        });

    if (minDistance && maxDistance) {
        providersWithDistance = providersWithDistance.filter(obj => obj.distance >= parseFloat(minDistance) && obj.distance <= parseFloat(maxDistance));
    }

    return res.send({
        totalCount: providersWithDistance.length,
        users: providersWithDistance,
    })
});

router.get('/logout', async (req, res) => {
    res.cookie('refreshToken', '', { maxAge: 1 });
    return res.status(200).send({ message: 'successfully logout' })
});

router.get('/getUser/:id', verifyToken(['admin', 'client', 'serviceProvider']), async (req, res) => {

    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Malformed user id');
    }

    const user = await User.findById(req.params.id).select('-password -__v');
    if (!user) {
        return res.status(400).send('user not found');
    }
    return res.send(user);
});

router.put('/upload/avatar', upload.single('avatar'), verifyToken(['admin', 'client', 'serviceProvider']), async (req, res) => {
    const imageUri = process.env.SERVER_URL + '/' + req.file.path.replace(/\\/g, '/').replace('public/', '');
    const updateAvatar = await User.findOneAndUpdate({ _id: req.user._id }, { avatar: imageUri }, { new: true }).select('-password -__v');

    return res.send({ updateAvatar: updateAvatar })
});

module.exports = router;