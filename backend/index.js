const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const socketIo = require('socket.io');

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
const orderRoute = require('./routes/orders');
const cardRoute = require('./routes/cards');
const contactRoute = require('./routes/contacts');
const Message = require('./models/Message');
const PaymentRoute = require('./routes/payments');
const DashboardRoute = require('./routes/dashboard');
const ReviewRoute = require('./routes/reviews');

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
app.use('/api/orders', orderRoute);
app.use('/api/cards', cardRoute);
app.use('/api/contacts', contactRoute);
app.use('/api/payments', PaymentRoute);
app.use('/api/dashboards', DashboardRoute);
app.use('/api/reviews', ReviewRoute);

const server = http.createServer(app);
// Set up Socket.io with proper CORS handling
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3001'], // Include all client app origins
    methods: ["GET", "POST"], // Allowed methods
    credentials: true // Enable credentials (cookies, sessions, etc.)
  }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join room', (room) => {
        socket.join(room);
    });

    socket.on('chat message', async (msg) => {
        console.log(msg, '------------------')
        io.to(msg.room).emit('chat message', msg);
        
        const newMessage = new Message({
            content: msg.text,
            sender: msg.sender,
            receiver: msg.receiver,
            contact: msg.contact,
        });
        
        await newMessage.save();
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(PORT, () => console.log(`🛺  API Server UP and Running at ${process.env.SERVER_URL}`));

