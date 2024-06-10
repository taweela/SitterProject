const Service = require('../models/Service');
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

router.get('/getService/:id', verifyToken(['serviceProvider']), async (req, res) => {

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


module.exports = router;