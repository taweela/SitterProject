const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3008;


// Connect to DB
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        // Connection successful
        console.log('👓 Connected to DB')
    })
    .catch((error) => {
        // Handle connection error
        console.log('Connection Error => : ', error.message)
    });

// Import routes
const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const serviceRoute = require('./routes/services');

// increase parse limit
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(express.static("public"))

// Middleware
app.use(
    cors({
        credentials: true,
        origin: [
            'http://localhost:3000',
            'http://localhost:3001',
        ],
    }),
);

app.use(express.json());
app.use(cookieParser());

// Route middleware
app.get('/', (req, res) => {
    res.send('SmartSitter API Server is running!');
});

app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/services', serviceRoute);

app.listen(PORT, () => console.log(`🛺  API Server UP and Running at ${process.env.SERVER_URL}`));

