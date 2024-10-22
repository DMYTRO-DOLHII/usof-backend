const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/controller.favourite');
const { validateToken } = require('../middlewares/middleware.auth');

router.get('/', validateToken, favoriteController.getFavourites);

router.post('/:post_id', validateToken, favoriteController.addFavourite);

router.delete('/:post_id', validateToken, favoriteController.removeFavourite);

module.exports = router;