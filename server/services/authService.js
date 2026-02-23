const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

class AuthService {
    async register(userData) {
        const { email, password, display_name, phone } = userData;

        // Check if user exists
        const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            throw { status: 400, message: 'User already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await query(
            'INSERT INTO users (email, password_hash, display_name, phone) VALUES ($1, $2, $3, $4) RETURNING id, email, role, display_name',
            [email, hashedPassword, display_name, phone]
        );

        const user = result.rows[0];
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return { user, accessToken, refreshToken };
    }

    async login(email, password) {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            throw { status: 401, message: 'Invalid credentials' };
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw { status: 401, message: 'Invalid credentials' };
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        delete user.password_hash;
        return { user, accessToken, refreshToken };
    }

    async refreshToken(token) {
        if (!token) throw { status: 401, message: 'Refresh token required' };

        const { verifyRefreshToken } = require('../utils/jwt');
        try {
            const decoded = verifyRefreshToken(token);
            const result = await query('SELECT id, email, role FROM users WHERE id = $1', [decoded.id]);
            if (result.rows.length === 0) {
                throw { status: 401, message: 'User no longer exists' };
            }

            const user = result.rows[0];
            const accessToken = generateAccessToken(user);
            return { accessToken };
        } catch (err) {
            throw { status: 401, message: 'Invalid or expired refresh token' };
        }
    }

    async getUserById(id) {
        const result = await query('SELECT id, email, role, display_name, phone, wallet_balance, kyc_status, kyc_data, created_at FROM users WHERE id = $1', [id]);
        return result.rows[0];
    }
}

module.exports = new AuthService();
