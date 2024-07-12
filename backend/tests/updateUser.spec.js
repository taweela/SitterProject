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
    email: "client@John.com",
    password: "password123",
    role: "client",
    address: "123 Main St, Anytown, AN",
    latitude: 40.7128,
    longitude: -74.0060,
};

describe('User Profile Update', () => {
    let clientAuthToken, sampleClientUser;

    before(async () => {
        const usersCollection = await getMongodbCollection('users');
        
        await usersCollection.insertOne(clientUser);
        sampleClientUser = clientUser;

        // Generate token
        clientAuthToken = jwt.sign({ _id: sampleClientUser._id, role: sampleClientUser.role }, process.env.AUTH_TOKEN_SECRET);
    });

    it('should update user information successfully', async () => {
        const payload = {
            firstName: 'Johnny',
            lastName: 'Smith',
            email: "Johnny@Johnny.com",
            address: '456 Another St, Newtown, NT',
            latitude: 34.0522,
            longitude: -118.2437
        };

        const response = await request.put(`${process.env.SERVER_URL}/api/users/update/${sampleClientUser._id}`, {
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
        expect(response.body).to.have.property('updatedUser').that.is.an('object');
        expect(response.body.updatedUser).to.include({
            firstName: payload.firstName,
            lastName: payload.lastName,
            address: payload.address,
            latitude: payload.latitude,
            longitude: payload.longitude
        });
        expect(response.body).to.have.property('message').that.equals('User successfully updated');
    });

    it('should fail to update user if required fields are missing', async () => {
        const payload = {
            firstName: '',
            lastName: ''
        };

        try {
            await request.put(`${process.env.SERVER_URL}/api/users/update/${sampleClientUser._id}`, {
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
            expect(error.error.errors).to.have.property('firstName').that.is.an('object');
            expect(error.error.errors).to.have.property('lastName').that.is.an('object');
        }
    });

    after(async () => {
        const usersCollection = await getMongodbCollection('users');
        await usersCollection.deleteOne({ _id: sampleClientUser._id });
    });
});
