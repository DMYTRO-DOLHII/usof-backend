const express = require('express');
const app = express();
const swaggerUI = require("swagger-ui-express");
const swaggerDoc = require('../swagger-output.json');
const adminRouter = require('./utils/admin');
const path = require('path');
const cors = require('cors');

require('dotenv').config();


const authRouter = require('./routes/route.auth');
const usersRouter = require('./routes/route.users');
const postsRouter = require('./routes/route.posts')
const categoriesRouter = require('./routes/route.categories');
const commentsRouter = require('./routes/route.comments');
const favouriteRouter = require('./routes/route.favourite');

app.use(express.json());

const allowedOrigins = [
    'http://localhost:3000',
    `http://${process.env.IP}:3000`,
];

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/admin', adminRouter);

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts/', postsRouter);
app.use('/api/categories/', categoriesRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/favourite/', favouriteRouter);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDoc));

module.exports = app;
