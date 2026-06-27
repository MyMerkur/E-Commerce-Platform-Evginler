module.exports = (req, res, next) => {
    res.apiSuccess = (data = null, message = 'OK', statusCode = 200) => {
        return res.status(statusCode).json({
            success: true,
            data,
            message,
            errors: null
        });
    };

    res.apiError = (message = 'Bir hata oluştu.', statusCode = 500, errors = null) => {
        return res.status(statusCode).json({
            success: false,
            data: null,
            message,
            errors
        });
    };

    next();
};
