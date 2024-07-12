'use strict';

const expect = require('chai').expect;
const request = require('request-promise');
const { ObjectId } = require('mongodb');
const { getMongodbCollection } = require('../config/dbConfig');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const clientUser = {
    _id: new ObjectId(),
    firstName: "John",
    lastName: "Doe",
    email: "client@example.com",
    password: "password123",
    role: "client",
    address: "123 Main St, Anytown, AN",
    latitude: 40.7128,
    longitude: -74.0060,
    fromDate: new Date("2023-10-01T00:00:00.000Z"),
    toDate: new Date("2023-12-31T23:59:59.999Z")
};

const providerUser = {
    _id: new ObjectId(),
    firstName: "Jane",
    lastName: "Smith",
    email: "provider@example.com",
    password: "password123",
    role: "serviceProvider",
    address: "123 Main St, Anytown, AN",
    latitude: 40.7128,
    longitude: -74.0060,
    fromDate: new Date("2023-09-01T00:00:00.000Z"),
    toDate: new Date("2023-12-31T23:59:59.999Z")
};

describe('Order Placement', () => {
    let authToken, sampleClientUser, sampleProviderUser;

    before(async () => {
        const collection = await getMongodbCollection('users');
        await collection.insertOne(clientUser);
        await collection.insertOne(providerUser);

        sampleClientUser = clientUser;
        sampleProviderUser = providerUser;

        // Generate token
        authToken = jwt.sign({ _id: sampleClientUser._id, role: sampleClientUser.role }, process.env.AUTH_TOKEN_SECRET);

        // Ensure there are no pre-existing orders
        const collectionOrder = await getMongodbCollection('orders');
        await collectionOrder.deleteMany({});
    });

    it('should create an order successfully', async () => {
        const orderData = {
            title: "House Cleaning Service",
            provider: sampleProviderUser._id,
            type: "house",
            client: sampleClientUser._id,
            entity: new ObjectId(),
            start: moment.utc("2023-11-15T08:00").format("YYYY-MM-DDTHH:mm:ss"),
            end: moment.utc("2023-11-15T12:00").format("YYYY-MM-DDTHH:mm:ss"),
            description: "Need house cleaning service for 4 hours."
        };

        const response = await request.post(`${process.env.SERVER_URL}/api/orders/create`, {
            body: orderData,
            json: true,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            resolveWithFullResponse: true
        });

        // Assertions
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.have.property('order');
        expect(response.body.order.title).to.equal(orderData.title);
        expect(response.body.order.description).to.equal(orderData.description);
        expect(response.body.message).to.equal('Order successfully requested');
    });

    it('should return 400 error when order conflicts with existing order', async () => {
        // Arrange: Create a conflicting order
        const existingOrder = {
            client: sampleClientUser._id,
            provider: sampleProviderUser._id,
            type: "house",
            entity: new ObjectId(),
            start: moment.utc("2023-11-15T08:00").format(),
            end: moment.utc("2023-11-15T12:00").format(),
            description: "Conflicting order",
            title: "Existing Order",
            status: "pending"
        };
        
        const collectionOrder = await getMongodbCollection('orders');
        await collectionOrder.insertOne(existingOrder);

        // Act: Attempt to create a new order with conflicting dates
        const newOrderData = {
            title: "House Cleaning Service",
            provider: sampleProviderUser._id,
            type: "house",
            client: sampleClientUser._id,
            entity: new ObjectId(),
            start: moment.utc("2023-11-15T08:00").format("YYYY-MM-DDTHH:mm:ss"),
            end: moment.utc("2023-11-15T10:00").format("YYYY-MM-DDTHH:mm:ss"),
            description: "Attempting to create a conflicting order."
        };

        try {
            await request.post(`${process.env.SERVER_URL}/api/orders/create`, {
                body: newOrderData,
                json: true,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                resolveWithFullResponse: true
            });
        } catch (error) {
            // Assertions
            expect(error.statusCode).to.equal(400);
            expect(error.response.body).to.have.property('message', 'Order already exists, Please select other date');
        }
    });

    after(async () => {
        const collection = await getMongodbCollection('users');
        const collectionOrder = await getMongodbCollection('orders');
        await collection.deleteOne({ _id: sampleClientUser._id });
        await collection.deleteOne({ _id: sampleProviderUser._id });
        await collectionOrder.deleteMany({});
    });
});
