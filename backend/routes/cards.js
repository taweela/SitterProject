const Card = require('../models/Card');
const verifyToken = require('../utils/verifyToken');

const router = require('express').Router();

router.get('/getCard', verifyToken(['client', 'serviceProvider']), async (req, res) => {

    const card = await Card.findOne({ user: req.user._id }).select("-__v");
    if (card) {
        return res.send({ status: 'exist', message: 'There is existed Card information!' });
    } else {
        return res.send({ status: 'notFound', message: 'There is not existed Card information!' });
    }
});

router.post('/create', verifyToken(['client', 'serviceProvider']), async (req, res) => {
    const { cardNumber, expiration_date, cvc } = req.body;
    const card = new Card({
        user: req.user._id,
        cardNumber: cardNumber,
        expirationDate: expiration_date,
        cvc: cvc
    });
    try {
        const savedCard = await card.save()

        return res.send({ card: savedCard, message: 'Card successfully created' });
    } catch (err) {
        return res.status(400).send(err);
    }
});

module.exports = router;