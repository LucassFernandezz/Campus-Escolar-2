// routes/comunicados.js
const express = require('express');
const router = express.Router();
const Comunicado = require('../models/Comunicado');
const User = require('../models/User'); // Necesitamos el modelo User para verificar roles
const auth = require('../middleware/auth'); // Middleware de autenticación

// @route   POST /api/comunicados
// @desc    Publicar un nuevo comunicado
// @access  Private (Profesores y Directivos)
router.post('/', auth, async (req, res) => {
    const { titulo, contenido, rolDestinatario, cursoDestino } = req.body;

    try {
        // Verificar que el usuario sea profesor o directivo
        const user = await User.findById(req.user.id);
        if (!user || (user.rol !== 'profesor' && user.rol !== 'directivo' && user.rol !== 'admin_sitio')) {
            return res.status(403).json({ msg: 'Acceso denegado. Solo profesores, directivos o administradores pueden publicar comunicados.' });
        }

        const nuevoComunicado = new Comunicado({
            titulo,
            contenido,
            autor: req.user.id, // El ID del usuario autenticado es el autor
            rolDestinatario: rolDestinatario || 'todos', // Por defecto a 'todos' si no se especifica
            cursoDestino: cursoDestino // Puede ser null si no es para un curso específico
        });

        const comunicado = await nuevoComunicado.save();
        res.json(comunicado);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   GET /api/comunicados/mis-avisos
// @desc    Obtener comunicados relevantes para el usuario autenticado
// @access  Private (Todos los usuarios autenticados)
router.get('/mis-avisos', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        const userRole = user.rol;
        const userId = req.user.id; // ID del usuario autenticado

        // Construir la consulta para encontrar comunicados relevantes
        const query = {
            $or: [
                { rolDestinatario: 'todos' }, // Comunicados para todos
                { rolDestinatario: userRole }, // Comunicados para el rol específico del usuario
            ]
        };

        // Si el usuario es un estudiante, también buscar comunicados de sus cursos
        // (Esto requeriría que el modelo User tenga un campo 'cursos' o similar)
        // Por ahora, lo dejamos simple, pero es una mejora futura.
        // if (userRole === 'estudiante' && user.cursos && user.cursos.length > 0) {
        //     query.$or.push({ cursoDestino: { $in: user.cursos } });
        // }

        const comunicados = await Comunicado.find(query)
                                            .populate('autor', 'nombre rol') // Obtener nombre, email y rol del autor
                                            .sort({ fechaPublicacion: -1 }); // Los más recientes primero

        res.json(comunicados);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});


// @route   GET /api/comunicados
// @desc    Obtener comunicados filtrados por rol y curso (modo público para pruebas)
// @access  Público
router.get('/', async (req, res) => {
    try {
        const { rol, curso } = req.query; // ejemplo: ?rol=estudiante&curso=123

        let filtro = {
            $or: [
                { rolDestinatario: 'todos' },
                { rolDestinatario: rol }
            ]
        };

        if (curso) {
            filtro.$or.push({ cursoDestino: curso });
        }

        const comunicados = await Comunicado.find(filtro)
            .populate('autor', 'nombre apellido rol')
            .sort({ fechaPublicacion: -1 });

        res.json(comunicados);
    } catch (error) {
        console.error('Error al obtener comunicados:', error);
        res.status(500).json({ error: 'Error al obtener comunicados' });
    }
});


module.exports = router;