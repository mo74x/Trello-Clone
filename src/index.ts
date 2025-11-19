import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import boardRoutes from './routes/Board.js';
import listRoutes from './routes/lists.js'; // <--- Import Lists
import cardRoutes from './routes/card.js'; // <--- Import Cards

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow any frontend for now
    methods: ["GET", "POST", "PUT", "DELETE"]  }
});
const PORT = Number(process.env.PORT)||5656;
const MONGO_URL = process.env.MONGO_URI;

if (!MONGO_URL) {
  throw new Error('MONGO_URI environment variable is required');
}
app.use((req: any, res, next) => {
  req.io = io;
  next();
});


app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);

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

  
// *** Real-time Connection Logic ***
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // Frontend will emit this when entering a board page
  socket.on('joinBoard', (boardId) => {
    socket.join(boardId);
    console.log(`Socket ${socket.id} joined board: ${boardId}`);
  });

  // Frontend will emit this when leaving
  socket.on('leaveBoard', (boardId) => {
    socket.leave(boardId);
    console.log(`Socket ${socket.id} left board: ${boardId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});