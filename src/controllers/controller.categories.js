const Category = require('../models/model.category');
const Post = require('../models/model.post');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        return res.status(200).json(categories);
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.getCategoryById = async (req, res) => {
    const { category_id } = req.params;
    try {
        const category = await Category.findByPk(category_id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        return res.status(200).json(category);
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.getCategoryPosts = async (req, res) => {
    const { category_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const { totalPosts, posts } = await Post.findByCategoryId(category_id, { limit, offset });
        return res.status(200).json({
            totalPosts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            posts
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.createCategory = async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ message: 'Title is required' });
    }

    try {
        const newCategory = await Category.create({ title });
        return res.status(201).json({ message: 'Category created successfully', category: newCategory });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.updateCategory = async (req, res) => {
    const { category_id } = req.params;
    const { title } = req.body;

    try {
        const category = await Category.findByPk(category_id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        category.title = title || category.title;
        await category.save();

        return res.status(200).json({ message: 'Category updated successfully', category });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.deleteCategory = async (req, res) => {
    const { category_id } = req.params;

    try {
        const category = await Category.findByPk(category_id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await category.destroy();
        return res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};
