const mongoose = require('mongoose');

const BitacoraSchema = new mongoose.Schema({
    usuario: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    accion: { 
        type: String, 
        required: true 
    }, // Ej: "Subió tarea", "Publicó comunicado"
    detalle: { 
        type: String 
    }, // Info extra: título, archivo, materia, etc.
    fecha: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Bitacora', BitacoraSchema);
