const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (err) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: err.errors
        });
    }
};

const registerSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(8),
        display_name: z.string().min(2),
        phone: z.string().optional(),
    }),
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string(),
    }),
});

module.exports = { validate, registerSchema, loginSchema };
