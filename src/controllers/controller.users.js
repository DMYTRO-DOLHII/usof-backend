const UserModel = require('../models/model.user');

exports.getAllUsers = async (req, res) => {
    const { page, limit, order = 'rating' } = req.query;

    try {
        if (page && limit) {
            const pageNumber = parseInt(page) || 1;
            const limitNumber = parseInt(limit) || 30;
            const offset = (pageNumber - 1) * limitNumber;

            const { count, rows: users } = await UserModel.findAllAndCount({ limit, offset, order });

            const totalPages = Math.ceil(count / limit);

            return res.status(200).json({
                users,
                pagination: {
                    totalUsers: count,
                    currentPage: page,
                    totalPages,
                },
            });
        } else {
            const users = await UserModel.getAllUsers();
            return res.status(200).json({ users });
        }
    } catch (error) {
        console.error("Error fetching users:", error);
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
    const { login, password, email, fullName, role } = req.body;

    if (!login || !password || !fullName || !email || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const user = await UserModel.findUser({ login, email });
        if (user) {
            return res.status(400).json({ message: 'Error: User already exists.' });
        }

        const newUser = await UserModel.createUser({ login, password, email, fullName, role });

        return res.status(201).json({ message: 'User created successfully', newUser });
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

        user.profilePicture = req.file.path;
        await user.save();

        return res.status(200).json({ message: 'Avatar uploaded successfully', user });
    } catch (error) {
        return res.status(500).json({ message: 'Error uploading avatar' });
    }
};

exports.updateUser = async (req, res) => {
    const { user_id } = req.params;
    const { login, email, fullName, password, role } = req.body;

    try {
        const user = await UserModel.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (login) user.login = login;
        if (email) user.email = email;
        if (fullName) user.fullName = fullName;
        if (password) user.password = password;
        if (role) user.role = role;

        await user.save();

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
