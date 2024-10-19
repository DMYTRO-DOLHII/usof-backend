const PostModel = require('../models/model.post');
const CommentModel = require('../models/model.comment');
const LikeModel = require('../models/model.like');
const CategoryModel = require('../models/model.category');

exports.getAllPosts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const posts = await PostModel.findAll({ limit, offset });
        return res.status(200).json({ posts });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

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
    try {
        const comments = await CommentModel.findAllByPost(post_id);
        return res.status(200).json(comments);
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.getPostCategories = async (req, res) => {
    const { post_id } = req.params;
    try {
        const categories = await Category.findAll({ where: { postId: post_id } });
        return res.status(200).json(categories);
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.getPostLikes = async (req, res) => {
    const { post_id } = req.params;
    try {
        const likes = await Like.findAll({ where: { postId: post_id } });
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
            const categoryPromises = categories.map(cat => CategoryModel.create(cat));
            await Promise.all(categoryPromises);
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
        const newComment = await Comment.create({ content, postId: post_id, userId: req.user.id });
        return res.status(201).json({ message: 'Comment created successfully', comment: newComment });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.createPostLike = async (req, res) => {
    const { post_id } = req.params;
    try {
        const newLike = await Like.create({ postId: post_id, userId: req.user.id });
        return res.status(201).json({ message: 'Like added successfully', like: newLike });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.updatePost = async (req, res) => {
    const { post_id } = req.params;
    const { title, body, category } = req.body;
    try {
        const post = await Post.findByPk(post_id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.title = title || post.title;
        post.body = body || post.body;
        post.category = category || post.category;
        await post.save();

        return res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.deletePost = async (req, res) => {
    const { post_id } = req.params;
    try {
        const post = await Post.findByPk(post_id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        await post.destroy();
        return res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.deletePostLike = async (req, res) => {
    const { post_id } = req.params;
    try {
        const like = await Like.findOne({ where: { postId: post_id, userId: req.user.id } });
        if (!like) {
            return res.status(404).json({ message: 'Like not found' });
        }
        await like.destroy();
        return res.status(200).json({ message: 'Like removed successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};
