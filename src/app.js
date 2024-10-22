const express = require('express');
const app = express();
const swaggerUI = require("swagger-ui-express");
const swaggerDoc = require('../swagger-output.json');
const adminRouter = require('./utils/admin');

require('dotenv').config();


const authRouter = require('./routes/route.auth');
const usersRouter = require('./routes/route.users');
const postsRouter = require('./routes/route.posts')
const categoriesRouter = require('./routes/route.categories');
const commentsRouter = require('./routes/route.comments');
const favouriteRouter = require('./routes/route.favourite');

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Admin: http://localhost:3000/admin\nDox: http://localhost:3000/api-docs');
});


app.use('/admin', adminRouter);

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts/', postsRouter);
app.use('/api/categories/', categoriesRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/favourite/', favouriteRouter);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDoc));

module.exports = app;