'use strict';

const expect = require('chai').expect;
const request = require('request-promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getMongodbCollection } = require('../config/dbConfig');

describe('Login Authentication', () => {
    let sampleUser = {
        "email": "jane.doe@example.com",
        "password": "secretPassword"
    };
    let userId;
    let loginUrl = `${process.env.SERVER_URL}/api/auth/login`; // Replace with the actual URL
    let userCollection;

    before(async () => {
        // Connect to MongoDB and clear previous test user, if existing
        userCollection = await getMongodbCollection('users');
        await userCollection.deleteOne({ email: sampleUser.email });

        // Create hash password for storing in mock database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(sampleUser.password, salt);

        // User mock object
        let mockUser = {
            email: sampleUser.email,
            password: hashedPassword,
            role: 'user',
            status: 'active'
        };

        // Insert new mock user to database
        const { insertedId } = await userCollection.insertOne(mockUser);
        userId = insertedId;
    });

    it('should return status code 400 when email is not found', async () => {
        try {
            await request.post(loginUrl, {
                body: { email: "nonexisting@example.com", password: sampleUser.password },
                json: true,
                resolveWithFullResponse: true
            });
        } catch (error) {
            expect(error.statusCode).to.equal(400);
            expect(error.response.body.message).to.equal('Email provided is not a registered account');
        }
    });

    it('should return status code 400 when incorrect password', async () => {
        try {
            await request.post(loginUrl, {
                body: { ...sampleUser, password: "incorrectPassword" },
                json: true,
                resolveWithFullResponse: true
            });
        } catch (error) {
            expect(error.statusCode).to.equal(400);
            expect(error.response.body.message).to.equal('Email or password not found!');
        }
    });

    it('should return status code 400 when user role is admin', async () => {
        await userCollection.updateOne({ _id: userId }, { $set: { role: 'admin' } });
        
        try {
            await request.post(loginUrl, {
                body: sampleUser,
                json: true,
                resolveWithFullResponse: true
            });
        } catch (error) {
            expect(error.statusCode).to.equal(400);
            expect(error.response.body.message).to.equal('User role is not allowed');
        }

        // Set the user role back for next tests
        await userCollection.updateOne({ _id: userId }, { $set: { role: 'user' } });
    });

    it('should successfully log in the user and return authentication tokens', async () => {
        const response = await request.post(loginUrl, {
            body: sampleUser,
            json: true,
            resolveWithFullResponse: true
        });

        expect(response.statusCode).to.equal(200);
        expect(response.body).to.have.property('userData');
        expect(response.body).to.have.property('accessToken');
        expect(response.body.userData.email).to.equal(sampleUser.email);
        
        // Validate Access Token
        const decodedAccessToken = jwt.verify(response.body.accessToken, process.env.AUTH_TOKEN_SECRET);
        expect(decodedAccessToken).to.have.property('_id');
    });

    after(async () => {
        // Clean up - delete the user from the database
        if (userId) {
            await userCollection.deleteOne({ _id: userId });
        }
    });
});
