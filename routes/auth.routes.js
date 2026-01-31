const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario.model');

// Clave secreta (idealmente en .env, uso fallback por si acaso)
const SECRET = process.env.JWT_SECRET || 'secret_fallback_key';

// POST /api/auth/login-reportes
router.post('/login-reportes', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Usuario y contraseña requeridos' });
        }

        // 1. Buscar usuario
        const user = await Usuario.findByUsername(username);
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        // 2. Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        // 3. Generar Token (Expiración corta para seguridad extra, ej. 2 horas)
        const token = jwt.sign(
            { id: user.id_usuario, username: user.username, rol: user.rol },
            SECRET,
            { expiresIn: '2h' }
        );

        res.json({ success: true, token });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

module.exports = router;
