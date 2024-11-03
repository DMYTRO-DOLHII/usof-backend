const { faker } = require('@faker-js/faker');
const { User, Post, Category, Comment, Like, Favourite } = require('./db.model.db');
const bcrypt = require('bcryptjs/dist/bcrypt');

const MIN_ROWS = 5;

async function seedDatabase() {
    try {
        // Create users
        const users = [];

        const adminData = {
            login: 'admin',
            password: 'admin',
            fullName: 'Admin',
            email: 'admin@example.com',
            emailConfirmed: true,
            role: 'admin',
        };

        const hashedAdminPassword = await bcrypt.hash(adminData.password, 10);
        adminData.password = hashedAdminPassword;

        const [admin, created] = await User.findOrCreate({
            where: { email: adminData.email },
            defaults: adminData,
        });
        users.push(admin);

        // Create and store additional users
        for (let i = 0; i < MIN_ROWS; i++) {
            const userData = {
                login: faker.internet.userName(),
                password: faker.internet.password(),
                fullName: faker.person.fullName(),
                email: faker.internet.email(),
                emailConfirmed: true,
                profilePicture: faker.image.avatar(),
                rating: getRandomInt(0, 100),
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            userData.password = hashedPassword;

            const [user, created] = await User.findOrCreate({
                where: { email: userData.email },
                defaults: userData,
            });

            users.push(user); // Push each created user to the users array
        }

        const categories = [];
        for (let i = 0; i < MIN_ROWS; i++) {
            const category = await Category.create({
                title: faker.commerce.department(),
                description: faker.lorem.sentence(),
            });
            categories.push(category);
        }

        const posts = [];
        for (let i = 0; i < 100; i++) {
            const post = await Post.create({
                title: faker.lorem.sentence(),
                status: faker.helpers.arrayElement(['active', 'inactive']),
                content: faker.lorem.paragraph(),
                userId: users[Math.floor(Math.random() * users.length)].id,
            });

            const randomCategories = categories
                .sort(() => 0.5 - Math.random())
                .slice(0, getRandomInt(1, 3));
            await post.addCategories(randomCategories);

            posts.push(post);
        }

        const comments = [];
        for (let i = 0; i < MIN_ROWS; i++) {
            const comment = await Comment.create({
                content: faker.lorem.sentence(),
                postId: posts[Math.floor(Math.random() * posts.length)].id,
                userId: users[Math.floor(Math.random() * users.length)].id,
            });
            comments.push(comment);
        }

        for (let i = 0; i < MIN_ROWS; i++) {
            const like = await Like.create({
                type: faker.helpers.arrayElement(['like', 'dislike']),
                postId: posts[Math.floor(Math.random() * posts.length)].id,
                userId: users[Math.floor(Math.random() * users.length)].id,
                commentId: comments[Math.floor(Math.random() * comments.length)].id,
            });
        }

        for (let i = 0; i < MIN_ROWS; i++) {
            await Favourite.create({
                userId: users[Math.floor(Math.random() * users.length)].id,
                postId: posts[Math.floor(Math.random() * posts.length)].id,
            });
        }

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding the database:', error);
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

seedDatabase();
