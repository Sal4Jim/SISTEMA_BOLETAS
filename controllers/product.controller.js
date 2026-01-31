const Product = require('../models/product.model');
const fs = require('fs');
const path = require('path');

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

        const productData = {
            ...req.body,
            imagen: req.file ? `/images/productos/${req.file.filename}` : null
        };

        const newProduct = await Product.create(productData);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el producto', error: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtener producto actual para mantener la imagen si no se sube una nueva
        const currentProduct = await Product.findById(id);
        if (!currentProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        let imagenPath = currentProduct.imagen;

        if (req.file) {
            imagenPath = `/images/productos/${req.file.filename}`;

            // Si existe una imagen anterior y es diferente a la nueva (ej. cambió extensión o nombre), borrarla.
            // Si el nombre y extensión son iguales, Multer ya la sobrescribió en disco.
            if (currentProduct.imagen && currentProduct.imagen !== imagenPath) {
                const oldPath = path.join(__dirname, '../public', currentProduct.imagen);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        }

        const productData = {
            ...req.body,
            imagen: imagenPath
        };

        const result = await Product.update(id, productData);
        if (result === 0) {
            return res.status(404).json({ message: 'Producto no encontrado o no modificado' });
        }
        res.json({ message: 'Producto actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtener producto antes de eliminar para poder borrar su imagen
        const currentProduct = await Product.findById(id);

        const result = await Product.delete(id);
        if (result === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Borrar la imagen física asociada para no dejar basura
        if (currentProduct && currentProduct.imagen) {
            const imagePath = path.join(__dirname, '../public', currentProduct.imagen);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};