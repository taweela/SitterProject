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

describe('Fetch User Orders', () => {
    let clientAuthToken, providerAuthToken, sampleClientUser, sampleProviderUser;

    before(async () => {
        const collection = await getMongodbCollection('users');
        await collection.insertOne(clientUser);
        await collection.insertOne(providerUser);

        sampleClientUser = clientUser;
        sampleProviderUser = providerUser;

        // Generate tokens
        clientAuthToken = jwt.sign({ _id: sampleClientUser._id, role: sampleClientUser.role }, process.env.AUTH_TOKEN_SECRET);
        providerAuthToken = jwt.sign({ _id: sampleProviderUser._id, role: sampleProviderUser.role }, process.env.AUTH_TOKEN_SECRET);

        // Ensure there are no pre-existing orders
        const collectionOrder = await getMongodbCollection('orders');
        await collectionOrder.deleteMany({});
        
        // Insert sample orders
        const sampleOrders = [
            {
                client: sampleClientUser._id,
                provider: sampleProviderUser._id,
                type: "house",
                entity: new ObjectId(),
                startDate: new Date("2023-11-15T08:00"),
                endDate: new Date("2023-11-15T12:00"),
                description: "Sample order for testing",
                title: "House Cleaning Service",
                status: "pending"
            },
            {
                client: sampleClientUser._id,
                provider: sampleProviderUser._id,
                type: "car",
                entity: new ObjectId(),
                startDate: new Date("2023-11-16T08:00"),
                endDate: new Date("2023-11-16T12:00"),
                description: "Another sample order for testing",
                title: "Car Cleaning Service",
                status: "completed"
            }
        ];
        await collectionOrder.insertMany(sampleOrders);
    });

    it('should return orders for client user', async () => {
        const response = await request.get(`${process.env.SERVER_URL}/api/orders`, {
            json: true,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${clientAuthToken}`
            },
            resolveWithFullResponse: true
        });

        // Assertions
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.have.property('totalCount').that.is.a('number');
        expect(response.body).to.have.property('filteredCount').that.is.a('number');
        expect(response.body).to.have.property('orders').that.is.an('array');
        expect(response.body.orders.length).to.equal(response.body.filteredCount);

        // Check that the orders belong to the client
        response.body.orders.forEach(order => {
            expect(order.client._id).to.equal(sampleClientUser._id.toString());
        });
    });

    it('should return orders for provider user', async () => {
        const response = await request.get(`${process.env.SERVER_URL}/api/orders`, {
            json: true,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${providerAuthToken}`
            },
            resolveWithFullResponse: true
        });

        // Assertions
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.have.property('totalCount').that.is.a('number');
        expect(response.body).to.have.property('filteredCount').that.is.a('number');
        expect(response.body).to.have.property('orders').that.is.an('array');
        expect(response.body.orders.length).to.equal(response.body.filteredCount);

        // Check that the orders belong to the provider
        response.body.orders.forEach(order => {
            expect(order.provider._id).to.equal(sampleProviderUser._id.toString());
        });
    });

    it('should filter orders by status', async () => {
        const response = await request.get(`${process.env.SERVER_URL}/api/orders?status=pending`, {
            json: true,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${clientAuthToken}`
            },
            resolveWithFullResponse: true
        });

        // Assertions
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.have.property('totalCount').that.is.a('number');
        expect(response.body).to.have.property('filteredCount').that.is.a('number');
        expect(response.body).to.have.property('orders').that.is.an('array');
        expect(response.body.orders.length).to.equal(response.body.filteredCount);

        // Check that the filtered orders have the correct status
        response.body.orders.forEach(order => {
            expect(order.status).to.equal('pending');
        });
    });

    after(async () => {
        const collection = await getMongodbCollection('users');
        const collectionOrder = await getMongodbCollection('orders');
        await collection.deleteOne({ _id: sampleClientUser._id });
        await collection.deleteOne({ _id: sampleProviderUser._id });
        await collectionOrder.deleteMany({});
    });
});
