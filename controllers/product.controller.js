const Product = require('../models/product.model');

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const { nombre, precio, id_categoria } = req.body;

        // Validación según la base de datos (campos NOT NULL)
        if (!nombre || precio === undefined || !id_categoria) {
            return res.status(400).json({ message: 'Faltan datos obligatorios: nombre, precio y id_categoria' });
        }
        const newProduct = await Product.create(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el producto', error: error.message });
    }
};


module.exports = {
    getAllProducts,
    getProductById,
    createProduct
};