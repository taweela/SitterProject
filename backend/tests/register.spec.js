'use strict';

const expect = require('chai').expect;
const request = require('request-promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getMongodbCollection } = require('../config/dbConfig');

describe('User Registration', () => {
    let sampleUser = {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "password": "password123",
        "role": "client",
        "address": {
            "formatted_address": "123 Main St, Anytown, AN",
            "geometry": {
                "location": {
                    "lat": 40.7128,
                    "lng": -74.0060
                }
            }
        }
    };

    before(async () => {
        const collection = await getMongodbCollection('users');
        await collection.deleteOne({ email: sampleUser.email });
    });

    it('should return status code 400 with error message when the email already exists', async () => {
        // Pre-register an user.
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(sampleUser.password, salt);
        const collection = await getMongodbCollection('users');
        await collection.insertOne({
            ...sampleUser,
            password: hashPassword
        });

        // Attempt to register the same user again.
        try {
            await request.post(`${process.env.SERVER_URL}/api/auth/register`, {
                body: sampleUser,
                json: true,
                headers: {
                    'Accept': 'application/json'
                },
                resolveWithFullResponse: true
            });
        } catch (error) {
            expect(error.statusCode).to.equal(400);
            expect(error.response.body).to.equal('Email already exists');
        }

        // Clean up by deleting the inserted user
        await collection.deleteOne({ email: sampleUser.email });
    });

    it('should successfully register a new user and return status code 200 with user object and access token', async () => {
        // Attempt to register a new user
        const response = await request.post(`${process.env.SERVER_URL}/api/auth/register`, {
            body: sampleUser,
            json: true,
            headers: {
                'Accept': 'application/json'
            },
            resolveWithFullResponse: true
        });

        // Assertions
        expect(response.statusCode).to.equal(200);
        expect(response).to.be.an('object');
        expect(response.body).to.have.all.keys('user', 'accessToken', 'message');
        expect(response.body.user).to.not.have.property('password');
        expect(response.body.message).to.equal('User successfully registered');

        // Validate Access Token
        const decodedToken = jwt.verify(response.body.accessToken, process.env.AUTH_TOKEN_SECRET);
        expect(decodedToken).to.have.property('_id');

        // Clean up by deleting the inserted user
        const collection = await getMongodbCollection('users');
        await collection.deleteOne({ email: sampleUser.email });
    });

    after(async () => {
        const collection = await getMongodbCollection('users');
        await collection.deleteOne({ email: sampleUser.email });
    });
});
