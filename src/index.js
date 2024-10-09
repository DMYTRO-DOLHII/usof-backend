const app = require('./app');
const logger = require("./utils/logger");

const PORT = process.env.PORT || 3000;

// Start the server and listen on the defined port
app.listen(PORT, () => {
    logger.info(`Server is running http://localhost:${PORT}`);
});
