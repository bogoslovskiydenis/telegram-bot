const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Initialize Firebase Admin SDK
const serviceAccount = require('./service.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const app = express();

// Middleware
app.use(helmet()); // Helps secure Express apps with various HTTP headers
app.use(morgan('combined')); // HTTP request logger
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Custom middleware for logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Registration endpoint
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userRecord = await admin.auth().createUser({
            email,
            password
        });
        res.status(201).json({ message: 'User created successfully', uid: userRecord.uid });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userCredential = await admin.auth().getUserByEmail(email);
        // Note: In a real-world scenario, you would use Firebase Client SDK for authentication
        // This server-side login is for demonstration purposes only
        res.status(200).json({ message: 'Login successful', uid: userCredential.uid });
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
});

// Protected route example
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Access granted to protected route' });
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    admin.auth().verifyIdToken(token)
        .then((decodedToken) => {
            req.user = decodedToken;
            next();
        })
        .catch((error) => {
            res.sendStatus(403);
        });
}

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});