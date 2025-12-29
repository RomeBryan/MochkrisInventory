class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

class BadRequestError extends AppError {
    constructor(message = 'Bad Request') {
        super(message, 400);
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

class ConflictError extends AppError {
    constructor(message = 'Conflict') {
        super(message, 409);
    }
}

class ValidationError extends AppError {
    constructor(message = 'Validation failed', errors = []) {
        super(message, 422);
        this.errors = errors;
    }
}

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    if (res.headersSent) {
        return next(err);
    }

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
        return res.status(422).json({
            status: 'error',
            message: 'Validation failed',
            errors
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'error',
            message: 'Token expired'
        });
    }

    const statusCode = err.statusCode || 500;
    const status = statusCode >= 500 ? 'error' : 'fail';
    const message = statusCode >= 500 ? 'Something went wrong' : err.message;

    res.status(statusCode).json({
        status,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    ValidationError,
    errorHandler
};
