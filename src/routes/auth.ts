import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.Model.js';
import dotenv from 'dotenv'

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req: Request, res: Response) => {
    const { username, email, password }: { username?: string; email?: string; password?: string } = req.body ?? {};

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email, and password are required' });
    }
  
    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Create new user
      user = new User({ username, email, password });
  
      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
  
      await user.save();
  
      // Return JWT
      const payload = { id: user.id };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  
      res.json({ token, user: { id: user.id, username, email } });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  // @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req: Request, res: Response) => {
    const { email, password }: { email?: string; password?: string } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
  
    try {
      // Check for user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid Credentials' });
      }
  
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid Credentials' });
      }
  
      // Return JWT
      const payload = { id: user.id };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  
      res.json({ token, user: { id: user.id, username: user.username, email } });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

export default router;