'use strict';

const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const request = require('request-promise');
const { getMongodbCollection } = require('../config/dbConfig');
const { ObjectId } = require('mongodb');

// Definitions of sample users
const sampleUser = {
    _id: new ObjectId(),
    firstName: "Sample",
    lastName: "User",
    email: "sampleuser@example.com",
    password: "password123",
    role: "client",
    address: "123 Main St, Anytown, AN",
    latitude: 40.7128,
    longitude: -74.0060,
    favourite: []
};

const anotherUser = {
    _id: new ObjectId(),
    firstName: "Another",
    lastName: "User",
    email: "anotheruser@example.com",
    password: "password123",
    role: "client",
    address: "123 Main St, Anytown, AN",
    latitude: 40.7128,
    longitude: -74.0060,
    favourite: []
};

describe('Client Add Favorite Provider', () => {
    let authTokenClient;

    before(async () => {
        // Generate token
        authTokenClient = jwt.sign({ _id: sampleUser._id, role: 'client' }, process.env.AUTH_TOKEN_SECRET);

        // Insert sample users into database
        const usersCollection = await getMongodbCollection('users');
        await usersCollection.insertOne(sampleUser);
        await usersCollection.insertOne(anotherUser);
    });

    it('should add a user to favourites', async () => {
        const response = await request.put(`${process.env.SERVER_URL}/api/users/favourite/${sampleUser._id}`, {
            headers: {
                'Authorization': `Bearer ${authTokenClient}`,
                'Accept': 'application/json',
            },
            json: true,
            resolveWithFullResponse: true,
        });
        // Assertions
        expect(response.statusCode).to.equal(200);
        expect(response.body.updatedUser.favourite).to.include(sampleUser._id.toString());
        expect(response.body.message).to.equal('Favourite successfully updated');
    });

    it('should remove a user from favourites', async () => {
        // First, add the user to favourites
        await request.put(`${process.env.SERVER_URL}/api/users/favourite/${anotherUser._id}`, {
            headers: {
                'Authorization': `Bearer ${authTokenClient}`,
                'Accept': 'application/json',
            },
            json: true,
            resolveWithFullResponse: true,
        });

        // Then, remove the user from favourites
        const response = await request.put(`${process.env.SERVER_URL}/api/users/favourite/${anotherUser._id}`, {
            headers: {
                'Authorization': `Bearer ${authTokenClient}`,
                'Accept': 'application/json',
            },
            json: true,
            resolveWithFullResponse: true,
        });
        // Assertions
        expect(response.statusCode).to.equal(200);
        expect(response.body.updatedUser.favourite).to.not.include(sampleUser._id.toString());
        expect(response.body.message).to.equal('Favourite successfully updated');
    });

    it('should return an error if authorization token is missing or invalid', async () => {
        try {
            await request.put(`${process.env.SERVER_URL}/api/users/favourite/${sampleUser._id}`, {
                resolveWithFullResponse: true,
            });
        } catch (response) {
            // Assertions
            expect(response.statusCode).to.equal(401);
        }
    });

    after(async () => {
        // Cleanup: Remove users from the database
        const usersCollection = await getMongodbCollection('users');
        await usersCollection.deleteOne({ _id: sampleUser._id });
        await usersCollection.deleteOne({ _id: anotherUser._id });
    });
});
