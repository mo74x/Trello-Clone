import express from 'express'
import type { Response } from 'express'
import { auth } from '../middleware/auth.js'
import type { AuthRequest } from '../middleware/auth.js'
import List from '../models/List.Model.js'
import Board from '../models/Board.Model.js'
import Card from '../models/Card.Model.js'

const router = express.Router();

// @route   GET /api/cards/:boardId
// @desc    Get all cards for a board
router.get('/:boardId', auth, async (req: AuthRequest, res: Response) => {
    try {
      const cards = await Card.find({ boardId: req.params.boardId }).sort({ pos: 1 });
      res.json(cards);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

// @route   POST /api/cards
// @desc    Create a new card
router.post('/', auth, async (req: AuthRequest, res: Response) => {
    try {
      const { title, listId, boardId } = req.body;
  
      // Calculate position (bottom of the list)
      const lastCard = await Card.findOne({ listId }).sort({ pos: -1 });
      const newPos = lastCard ? lastCard.pos + 1024 : 1024;
  
      const newCard = new Card({
        title,
        listId,
        boardId,
        pos: newPos
      });
  
      const card = await newCard.save();
     // *** REAL-TIME EMIT ***
     req.io?.to(boardId).emit('cardCreated', card);
     res.json(card);
   } catch (err) {
     console.error(err);
     res.status(500).send('Server Error');
   }
  });
  
  export default router;  