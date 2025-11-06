module.exports = function(allowedRoles = []) {
    return (req, res, next) => {
        if (!req.user || !req.user.rol) return res.status(401).json({ msg:'No autenticado' });
        if (!allowedRoles.includes(req.user.rol)) return res.status(403).json({ msg:'Acceso denegado' });
        next();
    };
};
