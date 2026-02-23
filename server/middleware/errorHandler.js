const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    const code = err.code || 'INTERNAL_ERROR';

    res.status(status).json({
        success: false,
        error: message,
        code: code,
        details: process.env.NODE_ENV === 'development' ? err.details : undefined
    });
};

module.exports = errorHandler;
