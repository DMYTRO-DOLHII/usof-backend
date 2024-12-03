const { faker } = require('@faker-js/faker');
const { User, Post, Category, Comment, Like, Favourite, Reply } = require('./db.model.db');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

async function seedDatabase() {
    try {
        const users = [];

        const adminData = {
            login: 'admin',
            password: 'admin',
            fullName: 'Admin',
            email: 'admin@example.com',
            emailConfirmed: true,
            role: 'admin',
            profilePicture: 'uploads/admin.png',
        };

        const iuuddaData = {
            login: 'iuudda',
            password: 'iuudda',
            fullName: 'Mr. Iuudda',
            email: 'iuudda@gmail.com',
            emailConfirmed: true,
            role: 'user',
            profilePicture: 'uploads/priehali.gif',
        };

        const hashedAdminPassword = await bcrypt.hash(adminData.password, 10);
        const hashedIuuddaPassword = await bcrypt.hash(iuuddaData.password, 10);

        adminData.password = hashedAdminPassword;
        iuuddaData.password = hashedIuuddaPassword;

        const [admin] = await User.findOrCreate({
            where: { email: adminData.email },
            defaults: adminData,
        });

        const [iuudda] = await User.findOrCreate({
            where: { email: iuuddaData.email },
            defaults: iuuddaData,
        });

        users.push(admin);
        users.push(iuudda);

        for (let i = 0; i < 300; i++) {
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

            const [user] = await User.findOrCreate({
                where: { email: userData.email },
                defaults: userData,
            });

            users.push(user);
        }

        const uniqueCategoryTitles = new Set();

        while (uniqueCategoryTitles.size < 20) {
            uniqueCategoryTitles.add(faker.commerce.department());
        }

        const categories = [];
        for (const title of uniqueCategoryTitles) {
            const category = await Category.create({
                title,
                description: faker.lorem.sentence(),
            });
            categories.push(category);
        }


        const posts = [];
        for (let i = 0; i < 1500; i++) {
            const post = await Post.create({
                title: faker.lorem.sentence(),
                status: faker.helpers.arrayElement(['active', 'inactive']),
                content: faker.lorem.paragraph(),
                userId: users[Math.floor(Math.random() * users.length)].id,
            });

            const randomCategories = categories
                .sort(() => 0.5 - Math.random())
                .slice(0, getRandomInt(1, 5));
            await post.addCategories(randomCategories);

            posts.push(post);
        }

        const comments = [];
        for (let i = 0; i < 12000; i++) {
            const comment = await Comment.create({
                content: faker.lorem.sentence(),
                status: faker.helpers.arrayElement(['active', 'inactive']),
                postId: posts[Math.floor(Math.random() * posts.length)].id,
                userId: users[Math.floor(Math.random() * users.length)].id,
            });
            comments.push(comment);
        }

        for (const comment of comments) {
            if (Math.random() < 0.3) {
                const replyCount = getRandomInt(0, 10);
                for (let i = 0; i < replyCount; i++) {
                    await Reply.create({
                        content: faker.lorem.sentence(),
                        commentId: comment.id,
                        userId: users[Math.floor(Math.random() * users.length)].id,
                    });
                }
            }
        }

        // Post likes
        for (let i = 0; i < 10000; i++) {
            const like = await Like.create({
                type: faker.helpers.arrayElement(['like', 'dislike']),
                postId: posts[Math.floor(Math.random() * posts.length)].id,
                userId: users[Math.floor(Math.random() * users.length)].id,
                commentId: null,
            });
        }

        // Comment likes
        for (let i = 0; i < 60000; i++) {
            const comment = comments[Math.floor(Math.random() * comments.length)];
            const like = await Like.create({
                type: faker.helpers.arrayElement(['like', 'dislike']),
                postId: comment.postId,
                userId: users[Math.floor(Math.random() * users.length)].id,
                commentId: comment.id,
            });
        }

        for (let i = 0; i < 1500; i++) {
            await Favourite.create({
                userId: users[Math.floor(Math.random() * users.length)].id,
                postId: posts[Math.floor(Math.random() * posts.length)].id,
            });
        }

        console.log('Database seeded successfully!');
    } catch (error) {
        logger.error('Error seeding the database:', error);
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

seedDatabase();
