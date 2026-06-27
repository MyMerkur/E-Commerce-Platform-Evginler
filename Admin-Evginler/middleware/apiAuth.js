exports.requireAdmin = (req, res, next) => {
    if (!req.session.isAuthenticated || !req.session.admin || !req.admin) {
        return res.apiError('Admin oturumu gerekiyor.', 401);
    }

    next();
};
