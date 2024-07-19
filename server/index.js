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

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password
        });

        res.status(201).json({
            message: 'User registered successfully',
            uid: userRecord.uid
        });
    } catch (error) {
        console.error('Error creating new user:', error);
        res.status(500).json({ error: 'Error registering user' });
    }
});


// Login endpoint
app.post('/login', async (req, res) => {
    const { idToken } = req.body;

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        res.status(200).json({ message: 'Login successful', uid: decodedToken.uid });
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
});
let botText = {
    welcome: `**Супер-Бонусы лучшего казино Казахстана!**
**Рейтинг популярных слотов**
**Слоты с самыми большими выигрышами**
**Победные схемы от наших подписчиков**
**Вопрос-ответ и отзыв**`
};

// API эндпоинт для обновления текста
app.post('/api/update-text', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    botText.welcome = text;
    res.json({ message: 'Welcome text updated successfully', newText: botText.welcome });
});

// API эндпоинт для получения текущего текста
app.get('/api/get-text', (req, res) => {
    res.json({ text: botText.welcome });
});
// Protected route example
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Access granted to protected route' });
});
app.post('/api/update-text', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    botConfig.welcomeDescription = text;
    res.json({ message: 'Welcome text updated successfully' });
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