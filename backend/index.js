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
const orderRoute = require('./routes/orders');
const contactRoute = require('./routes/contacts');
const Message = require('./models/Message');
const PaymentRoute = require('./routes/payments');
const DashboardRoute = require('./routes/dashboard');
const ReviewRoute = require('./routes/reviews');
const NotificationRoute = require('./routes/notifications');
const Notification = require('./models/Notification');
const entityRoute = require('./routes/entity');
const reportRoute = require('./routes/reports');

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
app.use('/api/orders', orderRoute);
app.use('/api/contacts', contactRoute);
app.use('/api/payments', PaymentRoute);
app.use('/api/dashboards', DashboardRoute);
app.use('/api/reviews', ReviewRoute);
app.use('/api/notifications', NotificationRoute);
app.use('/api/entity', entityRoute);
app.use('/api/reports', reportRoute);

const server = http.createServer(app);
// Set up Socket.io with proper CORS handling
const io = socketIo(server, {
    cors: {
        origin: ['http://localhost:3000'],
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    socket.on('joinRoom', (room) => {
        socket.room = room;
        socket.join(room);
    });

    socket.on('chatMessage', async (msg) => {
        const newMessage = new Message({
            content: msg.text,
            sender: msg.sender,
            receiver: msg.receiver,
            contact: msg.contact,
        });

        const newMsg = await newMessage.save();
        const msg1 = await Message.aggregate([
            {
                $match: { _id: newMsg._id},
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'sender',
                    foreignField: '_id',
                    as: 'sender'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'receiver',
                    foreignField: '_id',
                    as: 'receiver'
                }
            },
            {
                $lookup: {
                    from: 'contacts',
                    localField: 'contact',
                    foreignField: '_id',
                    as: 'contact'
                }
            }
        ]);
        io.emit('message', msg1[0]);
        const notification = new Notification({
            sender: msg.sender,
            receiver: msg.receiver,
            content: "You have new message!",
            read: false,
            type: 'message'
        });
        await notification.save()
    });

    socket.on('disconnect', () => {
        io.emit('message', 'User has left the chat');
    });
});

server.listen(PORT, () => console.log(`🛺  API Server UP and Running at ${process.env.SERVER_URL}`));

