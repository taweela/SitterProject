const Service = require('../models/Service');
const verifyToken = require('../utils/verifyToken');

const router = require('express').Router();

router.get('/', verifyToken(['serviceProvider']), async (req, res) => {
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


module.exports = router;