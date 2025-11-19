import express from 'express'
import type { Response } from 'express'
import { auth } from '../middleware/auth.js'
import type { AuthRequest } from '../middleware/auth.js'
import List from '../models/List.Model.js'
import Board from '../models/Board.Model.js'
import Card from '../models/Card.Model.js'
import { emailQueue } from '../queus/emailQueue.js'
import User from '../models/User.Model.js'

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
  
  
// @route   PUT /api/cards/:id
// @desc    Update card (move, rename, or assign user)
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { listId, pos, boardId, title, newAssigneeId } = req.body;
    
    
    let card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ msg: 'Card not found' });
     if (newAssigneeId) {
      if (!card.assignees.includes(newAssigneeId)) {
        card.assignees.push(newAssigneeId);

             console.log("Skipping email queue (Redis not running)");
        
      }
    }

    // Update basic fields
    if (listId) card.listId = listId;
    if (pos) card.pos = pos;
    if (title) card.title = title;

    // *** ASSIGN USER LOGIC ***
    if (newAssigneeId) {
      // Add user to array if not already there
      if (!card.assignees.includes(newAssigneeId)) {
        card.assignees.push(newAssigneeId);

        // 1. Find the user to get their email
        const user = await User.findById(newAssigneeId);
        
        if (user) {
           // 2. Add job to Queue (Instant!)
           // This happens instantly, we don't wait for the email to send
           emailQueue.add('send-welcome-email', {
             email: user.email,
             cardTitle: card.title
           });
        }
      }
    }

    await card.save();

    req.io?.to(boardId).emit('cardUpdated', card);

    res.json(card);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
  export default router;  