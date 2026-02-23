let io;

const init = (instance) => {
    io = instance;
    console.log('[Socket] Initialized');

    io.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        socket.on('join_auction', (auctionId) => {
            socket.join(`auction:${auctionId}`);
            console.log(`[Socket] Client ${socket.id} joined auction:${auctionId}`);
        });

        socket.on('leave_auction', (auctionId) => {
            socket.leave(`auction:${auctionId}`);
            console.log(`[Socket] Client ${socket.id} left auction:${auctionId}`);
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
        });
    });
};

const broadcastBid = (auctionId, bidData) => {
    if (!io) return;
    io.to(`auction:${auctionId}`).emit('new_bid', bidData);
};

const broadcastAuctionStatus = (auctionId, status, data) => {
    if (!io) return;
    io.to(`auction:${auctionId}`).emit('auction_status_update', { status, ...data });
};

module.exports = {
    init,
    broadcastBid,
    broadcastAuctionStatus
};
