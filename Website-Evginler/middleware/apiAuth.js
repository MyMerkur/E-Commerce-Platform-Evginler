exports.requireUser = (req, res, next) => {
    if (!req.session.isAuthenticated || !req.session.user || !req.user) {
        return res.apiError('Oturum açmanız gerekiyor.', 401);
    }

    next();
};
