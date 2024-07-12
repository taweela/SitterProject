const Baby = require('../models/Baby');
const Dog = require('../models/Dog');
const House = require('../models/House');
const { ObjectId } = require('mongodb');
const verifyToken = require('../utils/verifyToken');

const router = require('express').Router();

router.get('/', verifyToken(['client', 'admin']), async (req, res) => {
    const query = { owner: new ObjectId(req.user._id) };

    try {
        const babyAggregate = await Baby.aggregate([
            { $match: query },
            { $project: { _id: 1, name: 1, entype: 'baby' } }
        ]);

        const dogAggregate = await Dog.aggregate([
            { $match: query },
            { $project: { _id: 1, name: 1, entype: 'dog' } }
        ]);

        const houseAggregate = await House.aggregate([
            { $match: query },
            { $project: { _id: 1, name: 1, entype: 'house' } }
        ]);

        const [babyResults, dogResults, houseResults] = await Promise.all([babyAggregate, dogAggregate, houseAggregate]);

        const allResults = [...babyResults, ...dogResults, ...houseResults];

        return res.send(allResults);
    } catch (error) {
        console.error(error);
        return res.status(500).send('An error occurred while fetching data.');
    }
});


router.post('/create', verifyToken(['client']), async (req, res) => {
    const { entype } = req.body;

    try {
        let entity;
        switch (entype) {
            case 'baby':
                entity = new Baby({
                    owner: req.user._id,
                    allergy: req.body.entityAllergy,
                    gender: req.body.entityGender,
                    name: req.body.entityName,
                    age: req.body.entityAge
                });
                break;
            case 'dog':
                entity = new Dog({
                    owner: req.user._id,
                    type: req.body.entityType,
                    gender: req.body.entityGender,
                    name: req.body.entityName,
                    age: req.body.entityAge
                });
                break;
            case 'house':
                entity = new House({
                    owner: req.user._id,
                    address: req.body.entityAddress,
                    rooms: req.body.entityRooms,
                    name: req.body.entityName,
                    floors: req.body.entityFloors
                });
                break;
            default:
                return res.status(400).send('Invalid entity type');
        }

        const savedEntity = await entity.save();
        return res.send({ entity: savedEntity, message: `${entype.charAt(0).toUpperCase() + entype.slice(1)} added successfully` });
    } catch (err) {
        return res.status(400).send(err);
    }
});

router.get('/data', verifyToken(['client']), async (req, res) => {
    const query = { owner: req.user._id }
    const babies = await Baby.find(query).populate({
        path: 'owner'
    });
    const dogs = await Dog.find(query).populate({
        path: 'owner'
    });
    const houses = await House.find(query).populate({
        path: 'owner'
    });
    return res.send({ babies, dogs, houses });
});

router.post('/delete/:id', verifyToken(['client']), async (req, res) => {
    const { type } = req.body;
    try {
        let entityModel;
        switch (type) {
            case 'baby':
                entityModel = Baby;
                break;
            case 'dog':
                entityModel = Dog;
                break;
            case 'house':
                entityModel = House;
                break;
            default:
                return res.status(400).send('Invalid entity type');
        }

        const entity = await entityModel.findOne({ _id: req.params.id });
        if (!entity) {
            return res.status(404).send({ message: 'Entity not found' });
        }

        await entityModel.deleteOne({ _id: req.params.id });
        return res.send({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} successfully deleted` });
    } catch (error) {
        return res.status(500).send({ message: 'An error occurred while deleting the entity', error: error.message });
    }
});


module.exports = router;