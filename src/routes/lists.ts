import express from 'express'
import type { Response } from 'express'
import { auth } from '../middleware/auth.js'
import type { AuthRequest } from '../middleware/auth.js'
import List from '../models/List.Model.js'
import Board from '../models/Board.Model.js'

const router = express.Router();

// @route   GET /api/lists/:boardId
// @desc    Get all lists for a board
router.get('/:boardId', auth, async (req: AuthRequest, res: Response) => {
    try {
      // Fetch lists and sort by 'pos' (ascending) so they appear in order
      const lists = await List.find({ boardId: req.params.boardId }).sort({ pos: 1 });
      res.json(lists);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });


// @route   POST /api/lists
// @desc    Create a new list
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { title, boardId } = req.body;

    // 1. Check permissions (Is user owner/member of board?)
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ msg: 'Board not found' });
    
    
    // 2. Find the last list to calculate position
    const lastList = await List.findOne({ boardId }).sort({ pos: -1 });
    const newPos = lastList ? lastList.pos + 1024 : 1024;

    // 3. Create List
    const newList = new List({
      title,
      boardId,
      pos: newPos
    });

    const list = await newList.save();
    // *** REAL-TIME EMIT ***
    // Notify everyone in the "boardId" room that a list was created
    req.io?.to(boardId).emit('listCreated', list);

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

export default router;