const express = require('express');
const app = express();
const swaggerUI = require("swagger-ui-express");
const swaggerDoc = require('../swagger-output.json');

require('dotenv').config();


const authRouter = require('./routes/route.auth');
const usersRouter = require('./routes/route.users');
const postsRouter = require('./routes/route.posts')
const categoriesRouter = require('./routes/route.categories');
const commentsRouter = require('./routes/route.comments');

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts/', postsRouter);
app.use('/api/categories/', categoriesRouter);
app.use('/api/comments', commentsRouter);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDoc));

app.get('/', (req, res) => {
    res.send('Welcome to USOF Backend API!');
});

module.exports = app;
