import express from 'express';
import type {Response} from 'express'
import Board from '../models/Board.Model.js';
import { auth } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = express.Router()

// @route   POST /api/boards
// @desc    Create a board
router.post('/', auth, async (req: AuthRequest, res: Response) => {
    try {
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }
  
      // Create new board, set owner to current user, add user to members
      const newBoard = new Board({
        title,
        owner: req.userId,
        members: [req.userId],
      });
  
      const board = await newBoard.save();
      res.json(board);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  
  // @route   GET /api/boards
  // @desc    Get all boards for the logged-in user
  router.get('/', auth, async (req: AuthRequest, res: Response) => {
    try {
      // Find boards where the members array contains the user's ID
      // .sort({ createdAt: -1 }) gives us the newest boards first
      const boards = await Board.find({ members: req.userId }).sort({ createdAt: -1 });
      res.json(boards);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  
// @route   GET /api/boards/:id
// @desc    Get a board by ID
router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
      const board = await Board.findById(req.params.id);
      
      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }
  
      // Security Check: Is the user actually a member of this board?
      if (!board.members.some(member => member.toString() === req.userId)) {
        return res.status(403).json({ message: 'Not authorized to view this board' });
      }
  
      res.json(board);
    } catch (err) {
      console.error(err);
      if ((err as any).kind === 'ObjectId') {
          return res.status(404).json({ message: 'Board not found' });
      }
      res.status(500).send('Server Error');
    }
  });
  
  export default router;