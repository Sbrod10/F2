const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// In-memory user store (extend to a real DB like PostgreSQL/MongoDB in production)
const users = new Map();
const userInteractions = new Map(); // for ML tracking

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, stylePreferences } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existingUser = [...users.values()].find(u => u.email === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    const user = {
      id: userId,
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      stylePreferences: stylePreferences || [],
      savedItems: [],
      searchHistory: [],
      outfitHistory: [],
      interactionCount: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    users.set(userId, user);
    userInteractions.set(userId, []);

    const token = jwt.sign({ userId, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    const { password: _, ...safeUser } = user;
    res.status(201).json({ token, user: safeUser, message: 'Account created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = [...users.values()].find(u => u.email === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    user.lastLogin = new Date().toISOString();

    const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', message: err.message });
  }
});

router.post('/verify', (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.get(decoded.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { password: _, ...safeUser } = user;
    res.json({ valid: true, user: safeUser });
  } catch {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

// Export users map for use in other routes
module.exports = router;
module.exports.users = users;
module.exports.userInteractions = userInteractions;
