'use strict';

const expect = require('chai').expect;
const request = require('request-promise');
const { ObjectId } = require('mongodb');
const { getMongodbCollection } = require('../config/dbConfig');
const jwt = require('jsonwebtoken');

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
};

describe('Payment Record Creation', () => {
    let clientAuthToken, providerAuthToken, sampleClientUser, sampleProviderUser, sampleOrder;

    before(async () => {
        const usersCollection = await getMongodbCollection('users');
        const ordersCollection = await getMongodbCollection('orders');
        const paymentsCollection = await getMongodbCollection('payments');
        
        await usersCollection.insertOne(clientUser);
        await usersCollection.insertOne(providerUser);

        sampleClientUser = clientUser;
        sampleProviderUser = providerUser;

        // Generate tokens
        clientAuthToken = jwt.sign({ _id: sampleClientUser._id, role: sampleClientUser.role }, process.env.AUTH_TOKEN_SECRET);
        providerAuthToken = jwt.sign({ _id: sampleProviderUser._id, role: sampleProviderUser.role }, process.env.AUTH_TOKEN_SECRET);

        // Ensure there are no pre-existing orders and payments
        await ordersCollection.deleteMany({});
        await paymentsCollection.deleteMany({});

        // Insert a sample order
        sampleOrder = {
            _id: new ObjectId(),
            client: sampleClientUser._id,
            provider: sampleProviderUser._id,
            type: "house",
            entity: new ObjectId(),
            startDate: new Date("2023-11-15T08:00"),
            endDate: new Date("2023-11-15T12:00"),
            description: "Sample order for testing",
            title: "House Cleaning Service",
            status: "pending"
        };
        await ordersCollection.insertOne(sampleOrder);
    });

    it('should create a payment for client user', async () => {
        const payload = {
            type: 'fixed',
            amount: '100',
            provider: sampleProviderUser._id,
            order: sampleOrder._id
        };

        const response = await request.post(`${process.env.SERVER_URL}/api/payments/create`, {
            json: true,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${clientAuthToken}`
            },
            body: payload,
            resolveWithFullResponse: true
        });

        // Assertions
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.have.property('payment').that.is.an('object');
        expect(response.body.payment).to.include({
            type: payload.type,
            amount: payload.amount,
            client: sampleClientUser._id.toString(),
            provider: sampleProviderUser._id.toString(),
            order: sampleOrder._id.toString()
        });
        expect(response.body).to.have.property('message').that.equals('Payment Done successfully');
    });

    it('should fail to create a payment if amount is missing', async () => {
        const payload = {
            type: 'fixed',
            provider: sampleProviderUser._id,
            order: sampleOrder._id
        };

        try {
            await request.post(`${process.env.SERVER_URL}/api/payments/create`, {
                json: true,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${clientAuthToken}`
                },
                body: payload,
                resolveWithFullResponse: true
            });
        } catch (error) {
            // Assertions
            expect(error.statusCode).to.equal(400);
            expect(error.error).to.have.property('errors').that.is.an('object');
            expect(error.error.errors).to.have.property('amount').that.is.an('object');
            expect(error.error.errors.amount.message).to.equal('Path `amount` is required.');
        }
    });

    after(async () => {
        const usersCollection = await getMongodbCollection('users');
        const ordersCollection = await getMongodbCollection('orders');
        const paymentsCollection = await getMongodbCollection('payments');
        await usersCollection.deleteOne({ _id: sampleClientUser._id });
        await usersCollection.deleteOne({ _id: sampleProviderUser._id });
        await ordersCollection.deleteMany({});
        await paymentsCollection.deleteMany({});
    });
});
