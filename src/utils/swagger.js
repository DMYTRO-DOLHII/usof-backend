const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'My API for McOk',
        description: 'Description'
    },
    host: 'localhost:8080'
};

const outputFile = '../../swagger-output.json';
const routes = ['../app.js'];


swaggerAutogen(outputFile, routes, doc);