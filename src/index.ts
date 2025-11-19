import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import boardRoutes from './routes/Board.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow any frontend for now
    methods: ["GET", "POST"]
  }
});
const PORT = Number(process.env.PORT)||5656;
const MONGO_URL = process.env.MONGO_URI;

if (!MONGO_URL) {
  throw new Error('MONGO_URI environment variable is required');
}

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);

app.get('/', (req, res) => {
  res.send('Hello, Trello Clone Backend!');
});

//DB Connection
mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

  
// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});