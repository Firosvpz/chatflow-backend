import { Server } from "socket.io";

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ["GET", "POST"],
            credentials: true,
            allowedHeaders: ["Authorization"],
            transports: ['websocket', 'polling']
        },
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
            skipMiddlewares: true,
        }
    })


    io.on('connection', (socket) => {
        console.log(`A user connected:${socket.id}`);

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        socket.on('join', (userId) => {
            console.log(`User ${userId} joined thier room`);
            socket.join(userId)
             // Send immediate confirmation
            socket.emit('joined', { success: true, userId });
        })

       socket.on('disconnect', (reason) => {
            console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
        });

    })
    return io
} 
