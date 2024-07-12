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

describe('Review Submission', () => {
    let authToken, reviewId;

    before(async () => {
        const collection = await getMongodbCollection('users');
        await collection.insertOne(clientUser);
        await collection.insertOne(providerUser);

        // Generate token
        authToken = jwt.sign({ _id: clientUser._id, role: clientUser.role }, process.env.AUTH_TOKEN_SECRET);
    });

    it('should create a review successfully', async () => {
        const reviewData = {
            description: "Great service!",
            client: clientUser._id.toString(),
            provider: providerUser._id.toString(),
            marks: 5,
            orderNumber: 1234
        };

        const response = await request.post(`${process.env.SERVER_URL}/api/reviews/create`, {
            body: reviewData,
            json: true,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            resolveWithFullResponse: true
        });

        reviewId = response.body.review._id;

        // Assertions
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.have.property('review');
        expect(response.body.review.description).to.equal(reviewData.description);
        expect(response.body.review.marks).to.equal(reviewData.marks);
        expect(response.body.message).to.equal('Review Posted successfully');
    });

    after(async () => {
        const collection = await getMongodbCollection('users');
        const collectionReview = await getMongodbCollection('reviews');
        await collection.deleteOne({ _id: clientUser._id });
        await collection.deleteOne({ _id: providerUser._id });
        await collectionReview.deleteOne({ _id: new ObjectId(reviewId) });
    });
});
