const Report = require('../models/Report');
const verifyToken = require('../utils/verifyToken');

const router = require('express').Router();

router.get('/', verifyToken(['admin']), async (req, res) => {
    const reports = await Report.find().populate({
        path: 'order'
    }).populate({
        path: 'reportor'
    }).select("-__v");
    return res.status(200).send({ reports: reports });
});

router.get('/getReport/:id', verifyToken(['admin']), async (req, res) => {
    const report = await Report.findOne({ _id: req.params.id }).populate({
        path: 'order'
    }).populate({
        path: 'reportor'
    }).select("-__v");
    return res.status(200).send({ report: report });
});

router.post('/create', verifyToken(['client', 'serviceProvider']), async (req, res) => {
    const { description, title, order, reportor } = req.body;
    const report = new Report({
        order: order,
        description: description,
        title: title,
        reportor: req.user._id,
    });
    try {
        const savedReport = await report.save()

        return res.status(200).send({ report: savedReport, message: 'Report Posted successfully' });
    } catch (err) {
        return res.status(400).send(err);
    }
});

module.exports = router;