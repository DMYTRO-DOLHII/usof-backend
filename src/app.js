const express = require('express');
const app = express();

// Middleware for parsing incoming requests with JSON payloads
app.use(express.json());

// A basic route for testing the server setup
app.get('/', (req, res) => {
    res.send('Welcome to USOF Backend API!');
});

// Export the app for use in index.js
module.exports = app;
