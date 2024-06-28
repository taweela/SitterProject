const Review = require('../models/Review');
const verifyToken = require('../utils/verifyToken');

const router = require('express').Router();

router.get('/:provider', verifyToken(['client', 'serviceProvider', 'admin']), async (req, res) => {
    const { provider } = req.params;
    const reviews = await Review.find({ provider: provider }).populate({
        path: 'client'
    }).populate({
        path: 'provider'
    }).select("-__v");
    return res.send({ reviews: reviews });
});

router.post('/create', verifyToken(['client', 'serviceProvider']), async (req, res) => {
    const { description, client, provider } = req.body;
    const review = new Review({
        client: client,
        description: description,
        provider: provider
    });
    try {
        const savedReview = await review.save()

        return res.send({ review: savedReview, message: 'Review Posted successfully' });
    } catch (err) {
        return res.status(400).send(err);
    }
});

module.exports = router;