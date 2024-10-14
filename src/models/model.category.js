const { Category } = require('../database/db.model.db');
const logger = require('../utils/logger');

class CategoryModel {
    static async create(name) {
        try {
            const newCategory = await Category.create({ name });
            return newCategory;
        } catch (error) {
            logger.error(`Category creation error: ${error.message}`);
            throw error;
        }
    }

    static async findAll() {
        try {
            return await Category.findAll();
        } catch (error) {
            logger.error(`Fetching categories error: ${error.message}`);
            throw error;
        }
    }

    static async findByPk(categoryId) {
        try {
            return await Category.findByPk(categoryId);
        } catch (error) {
            logger.error(`Find category by ID error: ${error.message}`);
            throw error;
        }
    }

    static async updateCategory(categoryId, updateData) {
        try {
            await Category.update(updateData, { where: { id: categoryId } });
            return await Category.findOne({ where: { id: categoryId } });
        } catch (error) {
            logger.error(`Category update error: ${error.message}`);
            throw error;
        }
    }

    static async deleteCategory(categoryId) {
        try {
            return await Category.destroy({ where: { id: categoryId } });
        } catch (error) {
            logger.error(`Category deletion error: ${error.message}`);
            throw error;
        }
    }
}

module.exports = CategoryModel;
