const router = require('express').Router();
const User = require("../models/User");
const verifyToken = require('../utils/verifyToken');
const mongoose = require('mongoose');
const multer = require("multer");
const path = require("path");
const { getDistanceBetween } = require('../utils/utils');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_APIKEY);

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

router.delete('/delete/:id', verifyToken(['admin']), async (req, res) => {
    await User.deleteOne({ _id: req.params.id });
    return res.send({ message: 'User successfully deleted!' });
});

router.put('/manageStatus/:id', verifyToken(['admin']), async (req, res) => {
    const updateValues = req.body;
    const user = await User.findOneAndUpdate({ _id: req.params.id }, updateValues, {
        new: true,
    });
    const frontendUrl = process.env.FRONTEND_URL;
    const loginLink = `${frontendUrl}/login`;
    const htmlContent = `
        <p>Hi ${user.firstName} ${user.lastName},</p>
        <p>Your Account had become ${user.status}</p>
        <p>To connect the our site, click the link below:</p>
        <a href="${loginLink}" target="_blank">Connect Website</a>
        <p>Thank you!</p>
    `;

    const msg = {
        to: user.email,
        from: process.env.SENDER_EMAIL,
        subject: `Account Status Updated!`,
        html: htmlContent,
    };

    try {
        await sgMail.send(msg);
    } catch(error) {
        return res.status(500).send({ status: 'error', message: error.toString() })
    }
    return res.send({ message: 'User Status successfully updated' });
});

router.put('/update/:id', verifyToken(['admin', 'client', 'serviceProvider']), async (req, res) => {
    const updateValues = req.body;
    const updatedUser = await User.findOneAndUpdate({ _id: req.params.id }, updateValues, {
        new: true,
    }).select('-__v');
    return res.send({ updatedUser: updatedUser, message: 'User successfully updated' });
});

module.exports = router;