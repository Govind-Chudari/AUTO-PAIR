const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const config = require('./src/config/env');

// Create HTTP server instance
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  // Join a repair tracking room
  socket.on('tracking:subscribe', ({ requestId }) => {
    socket.join(`repair:${requestId}`);
    console.log(`📍 ${socket.id} subscribed to repair:${requestId}`);
  });

  // Join a chat room
  socket.on('chat:join', ({ requestId }) => {
    socket.join(`chat:${requestId}`);
    console.log(`💬 ${socket.id} joined chat:${requestId}`);
  });

  // Chat message
  socket.on('chat:message', ({ requestId, senderId, message }) => {
    io.to(`chat:${requestId}`).emit('chat:message', {
      requestId,
      senderId,
      message,
      timestamp: new Date().toISOString(),
    });
  });

  // Typing indicator
  socket.on('chat:typing', ({ requestId, isTyping, userId }) => {
    socket.to(`chat:${requestId}`).emit('chat:typing', { userId, isTyping });
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Make io accessible to controllers (for emitting events)
app.set('io', io);

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════╗
  ║                                            ║
  ║   🚗  AUTO-PAIR API Server                 ║
  ║                                            ║
  ║   Port: ${PORT}                              ║
  ║   Env:  ${config.nodeEnv.padEnd(20)}       ║
  ║   URL:  http://localhost:${PORT}              ║
  ║                                            ║
  ╚════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
