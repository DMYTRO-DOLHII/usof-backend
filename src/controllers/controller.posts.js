const PostModel = require('../models/model.post');
const CommentModel = require('../models/model.comment');
const LikeModel = require('../models/model.like');
const CategoryModel = require('../models/model.category');
const UserModel = require('../models/model.user');
const { Post, Comment } = require('../database/db.model.db');
const logger = require('../utils/logger');

exports.getAllPosts = async (req, res) => {
    const { limit, offset, search, sort } = req.query;

    try {
        const { count, rows: posts } = await PostModel.findAllBySearchAndCount({
            limit: limit || 30,
            offset: offset,
            search: search || '',
            sort: sort
        });

        return res.status(200).json({
            posts: posts,
            pagination: {
                totalItems: count,
            },
        });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};


exports.getUserAllPosts = async (req, res) => {
    const { user_id } = req.params;

    try {
        const posts = await PostModel.findAll4User(user_id);

        return res.status(200).json(posts);
    } catch (error) {
        logger.error(error.message);
        return res.status(500).josn({ message: error.message })
    }
};

exports.getPostsBySearch = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const search = req.query.search;
    const offset = (page - 1) * limit;

    try {
        const { count, rows: posts } = await PostModel.findAllBySearchAndCount({ limit, offset, search });

        const totalPages = Math.ceil(count / limit);

        return res.status(200).json({
            posts,
            pagination: {
                totalItems: count,
                currentPage: page,
                totalPages,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    };
}

exports.getPostById = async (req, res) => {
    const { post_id } = req.params;
    try {
        const post = await PostModel.findById(post_id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.getPostComments = async (req, res) => {
    const { post_id } = req.params;
    const { sort } = req.query;

    try {
        const comments = await CommentModel.findAllByPost(post_id, sort);
        return res.status(200).json(comments);
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.getPostCategories = async (req, res) => {
    const { post_id } = req.params;
    try {
        const post = await PostModel.findWithCategories(post_id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json(post.categories);

    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.getPostLikes = async (req, res) => {
    const { post_id } = req.params;
    try {
        const likes = await LikeModel.getAllByPost(post_id);
        return res.status(200).json(likes);
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.createPost = async (req, res) => {
    const { title, content, categories } = req.body;
    try {
        const newPost = await PostModel.create({ title, content, userId: req.user.id });

        if (categories && categories.length > 0) {
            const categoriesObjects = await CategoryModel.getAllCategories(categories);
            console.log(categoriesObjects);
            await newPost.setCategories(categoriesObjects);
        }

        return res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.createComment = async (req, res) => {
    const { post_id } = req.params;
    const { content } = req.body;
    try {
        const post = await PostModel.findById(post_id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const newComment = await CommentModel.create({ content, postId: post_id, userId: req.user.id });

        const comment = await Comment.findByPk(newComment.id, {
            include: ['likes', 'user', 'replies']
        })

        return res.status(201).json({ message: 'Comment created successfully', comment: comment });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.createPostLike = async (req, res) => {
    const { post_id } = req.params;
    const { type } = req.body;
    try {
        if (!type) {
            return res.status(404).json({ message: "Like type is missing" });
        }

        const post = await PostModel.findById(post_id);
        if (!post) {
            return res.status(404).json({ message: "Post was not found" });
        }

        const user = await UserModel.findById(post.userId);

        const existingLike = await LikeModel.find({ userId: req.user.id, postId: post_id });
        if (existingLike) {
            if (existingLike.type === type) {
                if (type === 'like') {
                    await existingLike.destroy();
                    user.rating -= 1;
                    await user.save();
                    return res.status(201).json({ message: "Like deleted" });
                } else {
                    await existingLike.destroy();
                    user.rating += 1;
                    await user.save();
                    return res.status(201).json({ message: "Dislike deleted" });
                }
            } else {
                if (type === 'like') {
                    existingLike.type = type;
                    user.rating += 2;
                    await user.save();
                    await existingLike.save();
                    return res.status(201).json({ message: "Dislike deleted, Like added" });
                } else {
                    existingLike.type = type;
                    user.rating -= 2;
                    await user.save();
                    await existingLike.save();
                    return res.status(201).json({ message: "Like deleted, Dislike added" });
                }
            }
        }

        const newLike = await LikeModel.create({ postId: post_id, userId: req.user.id, type: type });
        if (type === 'like') user.rating++;
        else user.rating--;

        await user.save();

        return res.status(201).json({ message: 'Like added successfully', like: newLike });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.deletePostLike = async (req, res) => {
    const { post_id } = req.params;
    try {
        const like = await LikeModel.find({ postId: post_id, userId: req.user.id });
        if (!like) {
            return res.status(404).json({ message: 'Like not found' });
        }

        await like.destroy();
        return res.status(200).json({ message: 'Like removed successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.updatePost = async (req, res) => {
    const { post_id } = req.params;
    const { title, content, status, categories } = req.body;
    try {
        const post = await PostModel.findById(post_id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.title = title || post.title;
        post.content = content || post.content;
        post.status = status || post.status;

        await post.save();

        if (categories && categories.length > 0) {
            const updatedCategories = await CategoryModel.getAllCategories(categories);
            await post.setCategories(updatedCategories);
        }

        return res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.deletePost = async (req, res) => {
    const { post_id } = req.params;
    try {
        const post = await PostModel.findById(post_id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        await post.destroy();
        return res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

