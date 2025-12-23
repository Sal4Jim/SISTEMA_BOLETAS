const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');

// Configuración de Multer para subir imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/images/productos');
        // Crear carpeta si no existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Usar el nombre del producto (sanitizado) como nombre de archivo
        let fileName = 'producto';
        if (req.body.nombre) {
            // Convertir a minúsculas, reemplazar espacios por guiones y quitar caracteres especiales
            fileName = req.body.nombre.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }
        cb(null, fileName + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', upload.single('imagen'), createProduct);
router.put('/:id', upload.single('imagen'), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;