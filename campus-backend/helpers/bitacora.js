const Bitacora = require('../models/Bitacora');

async function registrarAccion(usuarioId, accion, detalle = '') {
    try {
        const entry = new Bitacora({
            usuario: usuarioId,
            accion,
            detalle
        });
        await entry.save();
    } catch (err) {
        console.error('Error al guardar en bitácora:', err);
    }
}

module.exports = registrarAccion;
