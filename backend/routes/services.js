const Order = require('../models/Order');
const Service = require('../models/Service');
const User = require('../models/User');
const { getDistanceBetween } = require('../utils/utils');
const verifyToken = require('../utils/verifyToken');
const mongoose = require('mongoose');

const router = require('express').Router();

router.get('/', verifyToken(['client', 'serviceProvider']), async (req, res) => {
    const reqUser = req.user;
    let pFilter;
    if (reqUser && reqUser.role == 'serviceProvider') {
        pFilter = { user: req.user._id };
    } else {
        pFilter = {};
    }
    const totalCount = await Service.countDocuments({});
    const services = await Service.find(pFilter).select("-__v");
    return res.send({
        totalCount,
        services,
        filteredCount: services.length,
    });
});

router.get('/client', verifyToken(['client', 'admin']), async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const searchQuery = typeof req.query.q !== 'undefined' ? req.query.q : '';
    const statusFilter = (req.query.status !== '' && req.query.status !== 'undefined')
        ? { status: req.query.status }
        : {};
    const rateFilter = req.query.price && req.query.price !== 'undefined'
        ? {
            price: {
                $gte: parseInt(req.query.price.split(',')[0]),
                $lte: parseInt(req.query.price.split(',')[1])
            }
        }
        : {};
    let minDistance;
    let maxDistance;
    if (req.query.distance) {
        const distanceRange = req.query.distance?.split(',');
        minDistance = distanceRange[0];
        maxDistance = distanceRange[1];
    }

    const providerFilter = req.query.selectedTypes ? { 'user.providerType': { $in: req.query.selectedTypes.split(',') } } : {}

    try {
        const allServices = await Service.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: 'reviews',
                    localField: 'user._id',
                    foreignField: 'provider',
                    as: 'userReviews'
                }
            },
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'service',
                    as: 'order'
                }
            },
            {
                $match: {
                    $and: [
                        {
                            $or: [
                                { 'user.firstName': { $regex: searchQuery, $options: 'i' } },
                                { 'user.lastName': { $regex: searchQuery, $options: 'i' } },
                                { 'user.email': { $regex: searchQuery, $options: 'i' } },
                            ],
                        },
                        statusFilter,
                        rateFilter,
                        providerFilter
                    ]
                }
            },
            {
                $unwind: '$user'
            },
            {
                $unwind: {
                    path: '$userReviews',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$_id',
                    data: { $first: '$$ROOT' },
                    averageMarks: { $avg: '$userReviews.marks' }
                }
            },
            {
                $replaceRoot: {
                    newRoot: { $mergeObjects: ['$data', { averageMarks: '$averageMarks' }]}
                }
            }
        ]).skip(skip).limit(limit);

        const filteredServices = allServices.map(service => {
            if (service.order.length > 0) {
                if (service.order[0].client == req.user._id) {
                    return {
                        ...service,
                        isOrdered: true
                    };
                }
            } else {
                return {
                    ...service,
                    isOrdered: false
                };
            }
        }).filter(value => value !== null && value !== undefined);
        const user = await User.findById(req.user._id).select('-password -__v');
        const latitude = user.latitude;
        const longitude = user.longitude;
        let servicesWithDistance = filteredServices
            .filter(service => service.address) 
            .map(service => {
                const distance = getDistanceBetween(latitude, longitude, service.latitude, service.longitude).toFixed(2);
                return { distance, service };
            });

        if (minDistance && maxDistance) {
            servicesWithDistance = servicesWithDistance.filter(obj => obj.distance >= parseFloat(minDistance) && obj.distance <= parseFloat(maxDistance));
        }
        const totalCount = servicesWithDistance.length;

        return res.send({
            totalCount,
            services: servicesWithDistance,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});



router.post('/create', verifyToken(['serviceProvider']), async (req, res) => {
    const { title, description, address, serviceType, price, latitude, longitude, fromDate, toDate, fromTime, toTime } = req.body;
    const service = new Service({
        title: title,
        description: description,
        address: address,
        type: serviceType,
        price: price,
        latitude: latitude,
        longitude: longitude,
        fromDate: fromDate,
        toDate: toDate,
        fromTime: fromTime,
        toTime: toTime,
        user: req.user._id,
        status: 'active',
    });
    try {
        const savedService = await service.save()

        return res.send({ service: savedService, message: 'Service successfully posted' });
    } catch (err) {
        return res.status(400).send(err);
    }
});

router.put('/update/:id', verifyToken(['serviceProvider']), async (req, res) => {
    const { title, description, address, serviceType, price, latitude, longitude, fromDate, toDate, fromTime, toTime } = req.body;
    let updateValues;
    if (address) {
        updateValues = {
            title: title,
            description: description,
            address: address,
            type: serviceType,
            price: price,
            latitude: latitude,
            longitude: longitude,
            fromDate: fromDate,
            toDate: toDate,
            fromTime: fromTime,
            toTime: toTime,
        }
    } else {
        updateValues = {
            title: title,
            description: description,
            type: serviceType,
            price: price,
            fromDate: fromDate,
            toDate: toDate,
            fromTime: fromTime,
            toTime: toTime,
        }
    }

    const updatedService = await Service.findOneAndUpdate({ _id: req.params.id }, updateValues, {
        new: true,
    }).select('-__v');
    return res.send({ service: updatedService, message: 'Service successfully updated' });
});

router.get('/getService/:id', verifyToken(['serviceProvider', 'client', 'admin']), async (req, res) => {

    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Malformed Service id');
    }

    const service = await Service.findById(req.params.id).select('-__v').populate('user');;
    if (!service) {
        return res.status(400).send('service not found');
    }
    return res.send(service);
});

router.put('/manageStatus/:id', verifyToken(['serviceProvider']), async (req, res) => {
    const updateValues = req.body;
    await Service.findOneAndUpdate({ _id: req.params.id }, updateValues, {
        new: true,
    });
    return res.send({ message: 'successfully updated' });
});

router.delete('/delete/:id', verifyToken(['serviceProvider']), async (req, res) => {
    const updateValues = {
        status: 'deleted'
    };
    await Service.findOneAndUpdate({ _id: req.params.id }, updateValues, {
        new: true,
    });
    return res.send({ message: 'successfully deleted!' });
});

router.put('/favourite/:id', verifyToken(['admin', 'client']), async (req, res) => {
    const service = await Service.findById(req.params.id);
    const isFavourite = service.favourite.includes(req.user._id);
    if (!isFavourite) {
        service.favourite.push(req.user._id);
    } else if (isFavourite) {
        service.favourite = service.favourite.filter(id => id.toString() !== req.user._id.toString());
    }
    const updatedService = await service.save();
    return res.send({ updatedService: updatedService, message: 'Favourite successfully updated' });
});

module.exports = router;