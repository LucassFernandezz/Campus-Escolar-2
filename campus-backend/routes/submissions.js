const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Submission = require('../models/Submission');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Carpeta de uploads
const UPLOAD_DIR = path.join(__dirname, '../uploads/submissions');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + '-' + Math.round(Math.random()*1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${unique}${ext}`);
    }
});

function fileFilter(req, file, cb) {
    const allowed = /\.(pdf|doc|docx|ppt|pptx|zip|png|jpg|jpeg)$/i;
    if (!allowed.test(file.originalname)) {
        return cb(new Error('Tipo de archivo no permitido'), false);
    }
    cb(null, true);
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

// POST /api/submissions  -> crear mensaje / entrega (estudiante o profesor también puede enviar)
router.post('/', auth, upload.single('archivo'), async (req, res) => {
    try {
        // Puedes permitir que profesores publiquen entregas/mensajes también; aquí permitimos a cualquier usuario autenticado.
        const { titulo, contenido, tipo, materia } = req.body;

        if (!titulo) return res.status(400).json({ msg: 'El título es obligatorio' });

        const nuevo = new Submission({
            titulo,
        contenido: contenido || '',
        tipo: tipo || 'mensaje',
        materia: materia || null,
        autor: req.user.id
    });

    if (req.file) {
        // Guardamos nombre relativo para servirlo luego
        nuevo.archivoAdjunto = `/uploads/submissions/${req.file.filename}`;
    }

    const saved = await nuevo.save();
    return res.status(201).json(saved);
} catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Error al crear submission' });
}
});

// GET /api/submissions?materia=Nombre&rol=estudiante
// Si el usuario es profesor/directivo/admin puede pedir por materia (todos los envíos de esa materia).
// Si el usuario es estudiante, devuelve solo sus envíos (o los del rol/filtrado que quieras).
router.get('/', auth, async (req, res) => {
    try {
        const user = req.user; // { id, rol } comes from auth middleware
        const { materia } = req.query;

        let filtro = {};

        if (user.rol === 'estudiante') {
            // estudiante ve sus propios envíos
            filtro.autor = user.id;
            if (materia) filtro.materia = materia;
        } else {
            // profesor/admin/directivo pueden ver por materia (y ver todos)
            if (materia) filtro.materia = materia;
        }

        const envios = await Submission.find(filtro).populate('autor', 'nombre rol').sort({ fechaCreacion: -1 });
        res.json(envios);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error al obtener envíos' });
    }
});

module.exports = router;
