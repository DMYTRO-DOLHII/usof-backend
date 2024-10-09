const bcrypt = require('bcrypt');
const UserModel = require('../models/model.user');
const jwt = require('jsonwebtoken');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.getAllUsers();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch users' });
    }
};

exports.getUserById = async (req, res) => {
    const { user_id } = req.params;

    try {
        const user = await UserModel.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching user' });
    }
};

exports.createUser = async (req, res) => {
    const { login, password, confirmPassword, email, role } = req.body;

    if (!login || !password || !confirmPassword || !email || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            login,
            password: hashedPassword,
            email,
            role
        };

        const createdUser = await UserModel.createUser(newUser);
        return res.status(201).json({ message: 'User created successfully', user: createdUser });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating user' });
    }
};

exports.uploadUserAvatar = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Avatar file is required' });
    }

    try {
        const user = await UserModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.avatar = req.file.path;
        await user.save();

        return res.status(200).json({ message: 'Avatar uploaded successfully', avatar: user.avatar });
    } catch (error) {
        return res.status(500).json({ message: 'Error uploading avatar' });
    }
};

exports.updateUser = async (req, res) => {
    const { user_id } = req.params;
    const updateData = req.body;

    try {
        const user = await UserModel.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await UserModel.updateUser(user_id, updateData);
        return res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating user' });
    }
};

exports.deleteUser = async (req, res) => {
    const { user_id } = req.params;

    try {
        const user = await UserModel.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await UserModel.deleteUser(user_id);
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting user' });
    }
};
