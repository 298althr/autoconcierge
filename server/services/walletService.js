const { pool } = require('../config/database');
const notificationService = require('./notificationService');
const kycService = require('./kycService');

class WalletService {
    async getBalance(userId) {
        const result = await pool.query('SELECT wallet_balance, held_amount FROM users WHERE id = $1', [userId]);
        if (!result.rows[0]) throw { status: 404, message: 'Not found' };
        return {
            balance: parseFloat(result.rows[0].wallet_balance),
            held: parseFloat(result.rows[0].held_amount),
            available: parseFloat(result.rows[0].wallet_balance)
        };
    }

    async getTransactions(userId, limit, offset) {
        const result = await pool.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [userId, limit, offset]);
        return result.rows.map(tx => ({ ...tx, amount: parseFloat(tx.amount) }));
    }

    async executeTransaction(userId, { type, amount, status = 'completed', description, paystack_ref, escrow_id }, externalClient = null) {
        // Enforce KYC for outgoing or funding transactions above threshold
        if (['funding', 'bid_hold', 'purchase', 'escrow_hold'].includes(type)) {
            await kycService.enforceKYC(userId, amount);
        }

        const client = externalClient || await pool.connect();
        const shouldHandleTransaction = !externalClient;

        try {
            if (shouldHandleTransaction) await client.query('BEGIN');
            let newBalance;
            if (status === 'processing') {
                const userRes = await client.query('SELECT wallet_balance FROM users WHERE id = $1', [userId]);
                newBalance = parseFloat(userRes.rows[0].wallet_balance);
                const txRes = await client.query('INSERT INTO transactions (user_id, type, amount, balance_after, status, description, paystack_ref) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [userId, type, amount, newBalance, status, description, paystack_ref]);
                if (shouldHandleTransaction) await client.query('COMMIT');
                return txRes.rows[0];
            } else {
                const userRes = await client.query('SELECT wallet_balance, held_amount FROM users WHERE id = $1 FOR UPDATE', [userId]);
                let curBal = parseFloat(userRes.rows[0].wallet_balance);
                let curHeld = parseFloat(userRes.rows[0].held_amount);
                newBalance = curBal;
                let newHeld = curHeld;
                if (type === 'funding') newBalance += amount;
                else if (type === 'bid_hold' || type === 'escrow_hold') {
                    if (curBal < amount) throw { status: 400, message: 'Insufficient balance' };
                    newBalance -= amount;
                    newHeld += amount;
                }
                else if (type === 'bid_release' || type === 'escrow_release' || type === 'escrow_refund') {
                    if (curHeld < amount) throw { status: 400, message: 'Insufficient held funds' };
                    // If release, the money goes to the account balance
                    newBalance += amount;
                    newHeld -= amount;
                }
                await client.query('UPDATE users SET wallet_balance = $1, held_amount = $2 WHERE id = $3', [newBalance, newHeld, userId]);
                const txRes = await client.query(
                    'INSERT INTO transactions (user_id, type, amount, balance_after, status, description, paystack_ref, escrow_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
                    [userId, type, amount, newBalance, status, description, paystack_ref, escrow_id]
                );
                if (shouldHandleTransaction) await client.query('COMMIT');
                return txRes.rows[0];
            }
        } catch (err) {
            if (shouldHandleTransaction) await client.query('ROLLBACK');
            throw err;
        } finally {
            if (shouldHandleTransaction) client.release();
        }
    }

    async updateManualFunding(id, status) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const txRes = await client.query('SELECT * FROM transactions WHERE id = $1 AND status = $2 FOR UPDATE', [id, 'processing']);
            if (!txRes.rows[0]) throw new Error('Not found');
            const tx = txRes.rows[0];
            if (status === 'completed') {
                const userRes = await client.query('SELECT wallet_balance FROM users WHERE id = $1 FOR UPDATE', [tx.user_id]);
                const newBal = parseFloat(userRes.rows[0].wallet_balance) + parseFloat(tx.amount);
                await client.query('UPDATE users SET wallet_balance = $1 WHERE id = $2', [newBal, tx.user_id]);
                await client.query('UPDATE transactions SET status = $1, balance_after = $2 WHERE id = $3', ['completed', newBal, id]);
            } else {
                await client.query('UPDATE transactions SET status = $1 WHERE id = $2', ['failed', id]);
            }
            await client.query('COMMIT');

            // Send notification
            const finalTx = (await pool.query('SELECT * FROM transactions WHERE id = $1', [id])).rows[0];
            const userRes = await pool.query('SELECT id, email, display_name FROM users WHERE id = $1', [tx.user_id]);
            if (userRes.rows[0]) {
                notificationService.notifyFundingStatusUpdate(userRes.rows[0], finalTx);
            }

            return { id, status };
        } catch (err) { await client.query('ROLLBACK'); throw err; } finally { client.release(); }
    }

    async getAllTransactions(limit = 50, offset = 0, status = null) {
        let query = 'SELECT t.*, u.email, u.display_name FROM transactions t JOIN users u ON t.user_id = u.id';
        const params = [limit, offset];

        if (status) {
            query += ' WHERE t.status = $3';
            params.push(status);
        }

        query += ' ORDER BY t.created_at DESC LIMIT $1 OFFSET $2';

        const result = await pool.query(query, params);
        return result.rows.map(tx => ({
            ...tx,
            amount: parseFloat(tx.amount),
            balance_after: tx.balance_after ? parseFloat(tx.balance_after) : null
        }));
    }

    async cleanupPendingTransactions() {
        return [];
    }
}

module.exports = new WalletService();