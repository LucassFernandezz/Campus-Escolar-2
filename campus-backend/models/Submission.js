const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    titulo: { type: String, required: true, trim: true },
    contenido: { type: String, trim: true, default: '' },
    archivoAdjunto: { type: String, default: null }, // ruta relativa o nombre de archivo
    tipo: { type: String, enum: ['mensaje','entrega'], default: 'mensaje' }, // mensaje simple o entrega de tarea
    materia: { type: String, trim: true }, // nombre de la materia o id si lo cambias luego
    autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
