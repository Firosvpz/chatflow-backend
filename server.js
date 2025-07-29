import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from './routes/message.routes.js'
import userRoutes from './routes/user.routes.js'
import http from 'http'
import { initializeSocket } from "./config/socket.config.js";
import { setSocketServerInstance } from "./controllers/message.controller.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app)
const io = initializeSocket(server)

// Set the `io` instance for the message controller
setSocketServerInstance(io)

// middleware
app.use(
  cors({
    // origin: 'http://localhost:5173',
    origin:'https://chatflow-frontend.vercel.app',
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB()

app.use('/api', authRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/users', userRoutes)

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});