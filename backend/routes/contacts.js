const Contact = require('../models/Contact');
const Message = require('../models/Message');
const verifyToken = require('../utils/verifyToken');
const { ObjectId } = require('mongodb');
const router = require('express').Router();

router.get('/', verifyToken(['client', 'serviceProvider']), async (req, res) => {
    try {
        const userId = req.user._id;
        
        const aggregation = [
            {
                $match: {
                    $or: [{ client: new ObjectId(userId) }, { provider: new ObjectId(userId) }]
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'client',
                    foreignField: '_id',
                    as: 'client'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'provider',
                    foreignField: '_id',
                    as: 'provider'
                }
            },
            { $unwind: '$client' },
            { $unwind: '$provider' },
            {
                $lookup: {
                    from: 'messages',
                    let: { contactId: '$_id', userId: new ObjectId(userId) },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$contact', '$$contactId'] },
                                        {
                                            $or: [
                                                { $eq: ['$sender', '$$userId'] },
                                                { $eq: ['$receiver', '$$userId'] }
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'lastMessage'
                }
            },
            {
                $addFields: {
                    lastMessage: { $arrayElemAt: ['$lastMessage', 0] }
                }
            },
            {
                $lookup: {
                    from: 'messages',
                    let: { contactId: '$_id', userId: new ObjectId(userId) },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$contact', '$$contactId'] },
                                        { $eq: ['$receiver', '$$userId'] },
                                        { $eq: ['$readStatus', false] }
                                    ]
                                }
                            }
                        },
                        { $count: 'unreadCount' }
                    ],
                    as: 'unreadCountInfo'
                }
            },
            {
                $addFields: {
                    unreadCount: {
                        $ifNull: [{ $arrayElemAt: ['$unreadCountInfo.unreadCount', 0] }, 0]
                    }
                }
            },
            {
                $project: {
                    __v: 0,
                    'client.__v': 0,
                    'provider.__v': 0,
                    unreadCountInfo: 0 // Remove helper fields
                }
            }
        ];

        const contactsWithMessages = await Contact.aggregate(aggregation);

        return res.send({ status: 'success', contacts: contactsWithMessages });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});


router.post('/create', verifyToken(['client', 'serviceProvider']), async (req, res) => {
    const { provider } = req.body;
    const existedContact = await Contact.findOne({ client: req.user._id, provider: provider});
    if (!existedContact) {
        const contact = new Contact({
            client: req.user._id,
            provider: provider
        });
        try {
            const savedContact = await contact.save()
    
            return res.send({ contact: savedContact, message: 'Contact successfully created' });
        } catch (err) {
            return res.status(400).send(err);
        }
    } else {
        return res.send({ message: 'Already existed' });
    }
    
});

router.get('/selectChat', verifyToken(['admin', 'client', 'serviceProvider']), async (req, res) => {
    const contactQuery = typeof req.query.contactId !== 'undefined' && req.query.contactId !== "null" ? { contact: new ObjectId(req.query.contactId) } : {};

    const chats = await Message.aggregate([
        {
            $match: {
                ...contactQuery
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'sender',
                foreignField: '_id',
                as: 'sender'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'receiver',
                foreignField: '_id',
                as: 'receiver'
            }
        },
        {
            $lookup: {
                from: 'contacts',
                localField: 'contact',
                foreignField: '_id',
                as: 'contact'
            }
        },
        
    ])

    return res.status(200).send({ chats: chats })
});

module.exports = router;