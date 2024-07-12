'use strict';

const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const request = require('request-promise').defaults({ json: true });
const { getMongodbCollection } = require('../config/dbConfig');
const { ObjectId } = require('mongodb');

// Definitions of sample users
const sampleProviderUser = {
    _id: new ObjectId(),
    firstName: "Provider",
    lastName: "User",
    email: "provider@example.com",
    password: "password123",
    role: "serviceProvider",
    address: "123 Provider St, Anytown, AN",
    latitude: 40.7128,
    longitude: -74.0060
};

const sampleClientUser = {
    _id: new ObjectId(),
    firstName: "Client",
    lastName: "User",
    email: "client@example.com",
    password: "password123",
    role: "client",
    address: "456 Client St, Newtown, NT",
    latitude: 34.0522,
    longitude: -118.2437
};

describe('Fetch Service Provider Reviews', () => {
    let authTokenClient;
    let sampleReviews;

    before(async () => {
        // Generate tokens
        authTokenClient = jwt.sign({ _id: sampleClientUser._id, role: sampleClientUser.role }, process.env.AUTH_TOKEN_SECRET);

        // Create sample reviews in the database
        const usersCollection = await getMongodbCollection('users');
        await usersCollection.insertOne(sampleClientUser);
        const reviewsCollection = await getMongodbCollection('reviews');
        sampleReviews = [
            { client: sampleClientUser._id, provider: sampleProviderUser._id, reviewText: "Great service!", rating: 5, orderNumber: 9000 },
            { client: sampleClientUser._id, provider: sampleProviderUser._id, reviewText: "Very satisfied", rating: 4, orderNumber: 9001 }
        ];
        await reviewsCollection.insertMany(sampleReviews);
    });

    it('should fetch reviews for a given provider', async () => {
        const response = await request.get(`${process.env.SERVER_URL}/api/reviews/${sampleProviderUser._id}`, {
            json: true,
            headers: {
                'Authorization': `Bearer ${authTokenClient}`,
                'Accept': 'application/json',
            },
            resolveWithFullResponse: true,
        });
        // Assertions
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.have.property('reviews').that.is.an('array');
    });

    it('should return an error if authorization token is missing or invalid', async () => {
        try {
            await request.get(`${process.env.SERVER_URL}/api/reviews/${sampleProviderUser._id}`, {
                resolveWithFullResponse: true
            });
        } catch (response) {
            // Assertions
            expect(response.statusCode).to.equal(401);
        }
    });

    after(async () => {
        // Cleanup: Remove reviews from the database
        const usersCollection = await getMongodbCollection('users');
        await usersCollection.deleteOne({ _id: sampleClientUser._id });
        const reviewsCollection = await getMongodbCollection('reviews');
        await reviewsCollection.deleteMany({ provider: sampleProviderUser._id });
    });
});
