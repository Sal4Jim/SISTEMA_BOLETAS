const Category = require('../models/category.model');

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
    }
};

module.exports = { getAllCategories };