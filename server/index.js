const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: env.CLIENT_URL,
        methods: ['GET', 'POST']
    }
});

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            env.CLIENT_URL,
            ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [])
        ];

        if (
            allowedOrigins.some(o => origin.startsWith(o)) ||
            origin.includes('localhost') ||
            origin.includes('127.0.0.1')
        ) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());

const socketService = require('./services/socketService');
socketService.init(io);

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

const { globalLimiter, authLimiter, aiLimiter } = require('./middleware/rateLimiter');

app.use(morgan('dev'));
app.use('/api', globalLimiter);
app.use('/uploads', express.static('uploads'));

const { query } = require('./config/database');

app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/valuation', aiLimiter, require('./routes/valuationRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/auctions', require('./routes/auctionRoutes'));
app.use('/api/me', require('./routes/meRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/catalog', require('./routes/catalogRoutes'));
app.use('/api/concierge', require('./routes/conciergeRoutes'));
app.use('/api/blog', require('./routes/blogRoutes'));

app.get('/health', async (req, res) => {
    try {
        await query('SELECT 1');
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.get('/api/trigger-seed', (req, res) => {
    const { exec } = require('child_process');
    console.log('Starting background seed process...');
    exec('node db/seeds/catalog_seed.js && node db/seeds/automobile_specs_seed.js && node db/seeds/demo_seed.js && node db/seeds/market_valuations_seed.js', { maxBuffer: 1024 * 1024 * 50 }, (err, stdout, stderr) => {
        if (err) console.error('Seed Err:', err);
        console.log('Seed Stdout:', stdout);
        console.error('Seed Stderr:', stderr);
    });
    res.json({ message: 'Seeding started in background. Check Railway logs.' });
});

const auctionService = require('./services/auctionService');
const settlementService = require('./services/settlementService');
const cron = require('node-cron');

cron.schedule('* * * * *', async () => {
    try {
        await auctionService.processAuctionTransitions();
        await settlementService.processSettlementTimeouts();
    } catch (err) {
        console.error('[CRON] Error:', err.message);
    }
});

const walletService = require('./services/walletService');
setInterval(async () => {
    try {
        await walletService.cleanupPendingTransactions();
    } catch (err) {
        console.error('[CLEANUP] Error:', err.message);
    }
}, 3600000);

app.use(errorHandler);

const PORT = env.PORT;
server.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});