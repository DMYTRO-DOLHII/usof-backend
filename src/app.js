const express = require('express');
const app = express();

const authRouter = require('./routes/route.auth');

// Middleware for parsing incoming requests with JSON payloads
app.use(express.json());

app.use('/api/auth', authRouter);

// A basic route for testing the server setup
app.get('/', (req, res) => {
    res.send('Welcome to USOF Backend API!');
});

// Export the app for use in index.js
module.exports = app;
