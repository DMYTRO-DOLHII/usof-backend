const { Post, Category, Comment, Like, User, Favourite } = require('../database/db.model.db');
const { Op, Sequelize } = require('sequelize');
const logger = require('../utils/logger');

class PostModel {
    static async create({ title, content, userId, category }) {
        try {
            return await Post.create({
                title,
                content,
                userId,
                category
            });
        } catch (error) {
            logger.error(`Post creation error: ${error.message}`);
            throw error;
        }
    }

    static async findAll({ limit, offset }) {
        try {
            return await Post.findAll({ limit, offset });
        } catch (error) {
            logger.error(`Fetching posts error: ${error.message}`);
            throw error;
        }
    }

    static async findAll4User(userId) {
        try {
            return await Post.findAll({
                order: [['publishDate', 'DESC']],
                where: { userId: userId },
                include: [
                    {
                        model: Category,
                        as: 'categories',
                        attributes: ['id', 'title'],
                        through: { attributes: [] }
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'login', 'profilePicture']
                    }
                ],
                attributes: {
                    include: [
                        [
                            Sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM "Comments" AS "comments"
                                WHERE "comments"."postId" = "Post"."id"
                            )`),
                            "commentsCount"
                        ],
                        [
                            Sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM "Likes" AS "likes"
                                WHERE "likes"."postId" = "Post"."id" 
                                AND "likes"."commentId" is NULL 
                                AND "likes"."type" = 'like'
                            )`),
                            "likes"
                        ],
                        [
                            Sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM "Likes" AS "likes"
                                WHERE "likes"."postId" = "Post"."id" 
                                AND "likes"."commentId" is NULL 
                                AND "likes"."type" = 'dislike'
                            )`),
                            "dislikes"
                        ]
                    ]
                },
                distinct: true
            });
        } catch (error) {
            logger.error(`Fetching posts error: ${error.message}`);
            throw error;
        }
    }

    static async findAllBySearchAndCount({ limit, offset, search, sort }) {
        let order = [];
        let where = {
            [Op.or]: [
                { title: { [Op.like]: `%${search}%` } },
                { content: { [Op.like]: `%${search}%` } }
            ]
        };

        if (sort === 'active') where = { ...where, status: 'active' };
        if (sort === 'dateCreated') order = [['publishDate', 'DESC']];
        if (sort === 'highestScore') order = [[Sequelize.literal('"likes"'), 'DESC']];

        let categoryWhere = {};
        if (search.startsWith('-c')) {
            const categoryName = search.slice(2).trim();
            categoryWhere = {
                title: { [Op.like]: `%${categoryName}%` }
            };
            where = {};
        }

        try {
            return await Post.findAndCountAll({
                limit,
                offset,
                order: order,
                where: where,
                include: [
                    {
                        model: Category,
                        as: 'categories',
                        attributes: ['id', 'title'],
                        through: { attributes: [] },
                        where: categoryWhere
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'login', 'profilePicture']
                    }
                ],
                attributes: {
                    include: [
                        [
                            Sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM "Comments" AS "comments"
                                WHERE "comments"."postId" = "Post"."id"
                            )`),
                            "commentsCount"
                        ],
                        [
                            Sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM "Likes" AS "likes"
                                WHERE "likes"."postId" = "Post"."id" 
                                AND "likes"."commentId" is NULL 
                                AND "likes"."type" = 'like'
                            )`),
                            "likes"
                        ],
                        [
                            Sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM "Likes" AS "likes"
                                WHERE "likes"."postId" = "Post"."id" 
                                AND "likes"."commentId" is NULL 
                                AND "likes"."type" = 'dislike'
                            )`),
                            "dislikes"
                        ]
                    ]
                },
                distinct: true
            });
        } catch (error) {
            logger.error(`Fetching posts error: ${error.message}`);
            throw error;
        }
    }


    static async findById(postId) {
        try {
            return await Post.findByPk(postId, {
                include: ['likes', 'user', 'categories', 'favourites']
            });
        } catch (error) {
            logger.error(`Post retrieval error: ${error.message}`);
            throw error;
        }
    }

    static async findWithCategories(postId) {
        try {
            return await Post.findByPk(postId, { include: 'categories' });
        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    }

    static async updatePost(postId, updateData) {
        try {
            await Post.update(updateData, { where: { id: postId } });
            return await Post.findOne({ where: { id: postId } });
        } catch (error) {
            logger.error(`Post update error: ${error.message}`);
            throw error;
        }
    }

    static async deletePost(postId) {
        try {
            return await Post.destroy({ where: { id: postId } });
        } catch (error) {
            logger.error(`Post deletion error: ${error.message}`);
            throw error;
        }
    }
}

module.exports = PostModel;
