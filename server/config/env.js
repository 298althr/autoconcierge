const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { z } = require('zod');

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.string().transform(Number).default('4000'),
    DATABASE_URL: z.string().url(),
    CLIENT_URL: z.string().url().default('http://localhost:3001'),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    PAYSTACK_SECRET_KEY: z.string().optional(),
    GROQ_API_KEY: z.string().optional(),
    CLOUDINARY_URL: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    SENDGRID_API_KEY: z.string().optional(),
    SENDGRID_FROM_EMAIL: z.string().email().default('no-reply@Autogaard.ng')
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(env.error.format(), null, 2));
    process.exit(1);
}

module.exports = env.data;
