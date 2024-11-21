const { logger } = require('sequelize/lib/utils/logger');
const db = require('../database/db.model.db');

exports.getFavourites = async (req, res) => {
    try {
        const userId = req.user.id;

        const favorites = await db.Favourite.findAll({
            where: { userId },
            include: [{ model: db.Post, as: 'post' }]
        });

        res.status(200).json(favorites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPostFavourites = async (req, res) => {
    try {
        const { post_id } = req.params;

        const favourites = await db.Favourite.findAll({
            where: { postId: post_id }
        })

        res.status(200).json({ favourites });
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.addFavourite = async (req, res) => {
    try {
        const { post_id } = req.params;
        const userId = req.user.id;

        const post = await db.Post.findByPk(post_id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const favorite = await db.Favourite.create({ userId, postId: post_id });
        res.status(201).json(favorite);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeFavourite = async (req, res) => {
    try {
        const { post_id } = req.params;
        const userId = req.user.id;

        const favorite = await db.Favourite.findOne({ where: { userId: userId, postId: post_id } });
        if (!favorite) {
            return res.status(404).json({ message: 'Favorite not found' });
        }

        await favorite.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
