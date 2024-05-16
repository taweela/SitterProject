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
})


module.exports = router;