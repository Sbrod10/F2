const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { users, userInteractions } = require('./auth');

const router = express.Router();

// GET /api/user/profile
router.get('/profile', authenticateToken, (req, res) => {
  const user = users.get(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { password: _, ...safeUser } = user;
  const interactions = userInteractions.get(req.user.userId) || [];

  const stats = {
    totalSearches: interactions.filter(i => i.type === 'recommendation').length,
    environmentScans: interactions.filter(i => i.type === 'environment_scan').length,
    chatMessages: interactions.filter(i => i.type === 'chat').length,
    savedItems: user.savedItems.length
  };

  res.json({ success: true, user: safeUser, stats });
});

// PUT /api/user/preferences
router.put('/preferences', authenticateToken, (req, res) => {
  const user = users.get(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { stylePreferences, budget, favoriteColors, bodyType, ageRange, gender } = req.body;

  if (stylePreferences) user.stylePreferences = stylePreferences;
  if (budget) user.budget = budget;
  if (favoriteColors) user.favoriteColors = favoriteColors;
  if (bodyType) user.bodyType = bodyType;
  if (ageRange) user.ageRange = ageRange;
  if (gender) user.gender = gender;

  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser, message: 'Preferences updated — AI recommendations will improve!' });
});

// POST /api/user/save-item
router.post('/save-item', authenticateToken, (req, res) => {
  const user = users.get(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { item } = req.body;
  if (!item) return res.status(400).json({ error: 'Item required' });

  const alreadySaved = user.savedItems.some(i => i.id === item.id);
  if (alreadySaved) {
    user.savedItems = user.savedItems.filter(i => i.id !== item.id);
    return res.json({ success: true, saved: false, message: 'Item removed from saved' });
  }

  user.savedItems.unshift({ ...item, savedAt: new Date().toISOString() });
  if (user.savedItems.length > 100) user.savedItems = user.savedItems.slice(0, 100);

  res.json({ success: true, saved: true, message: 'Item saved to your wardrobe!', savedCount: user.savedItems.length });
});

// POST /api/user/save-outfit
router.post('/save-outfit', authenticateToken, (req, res) => {
  const user = users.get(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { outfit } = req.body;
  if (!outfit) return res.status(400).json({ error: 'Outfit required' });

  if (!user.outfitHistory) user.outfitHistory = [];
  user.outfitHistory.unshift({ ...outfit, savedAt: new Date().toISOString() });
  if (user.outfitHistory.length > 50) user.outfitHistory = user.outfitHistory.slice(0, 50);

  res.json({ success: true, message: 'Outfit saved!', count: user.outfitHistory.length });
});

// GET /api/user/insights - ML-powered style insights
router.get('/insights', authenticateToken, (req, res) => {
  const user = users.get(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const interactions = userInteractions.get(req.user.userId) || [];
  const savedItems = user.savedItems || [];

  // Analyze patterns from interaction history
  const styleFrequency = {};
  const colorFrequency = {};
  const occasionFrequency = {};

  interactions.forEach(interaction => {
    if (interaction.filters) {
      const { style, colors, occasion } = interaction.filters;
      if (style) styleFrequency[style] = (styleFrequency[style] || 0) + 1;
      if (occasion) occasionFrequency[occasion] = (occasionFrequency[occasion] || 0) + 1;
      if (Array.isArray(colors)) {
        colors.forEach(c => { colorFrequency[c] = (colorFrequency[c] || 0) + 1; });
      }
    }
  });

  const topStyle = Object.entries(styleFrequency).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topColor = Object.entries(colorFrequency).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topOccasion = Object.entries(occasionFrequency).sort((a, b) => b[1] - a[1])[0]?.[0];

  const insights = {
    totalInteractions: interactions.length,
    savedItems: savedItems.length,
    topStyle: topStyle || 'Still learning...',
    topColor: topColor || 'Still learning...',
    topOccasion: topOccasion || 'Still learning...',
    personalityType: getPersonalityType(topStyle),
    learningProgress: Math.min(100, Math.round((interactions.length / 20) * 100)),
    recentHistory: interactions.slice(-5).reverse()
  };

  res.json({ success: true, insights });
});

function getPersonalityType(style) {
  const types = {
    'Casual': 'The Comfort Queen/King',
    'Streetwear': 'The Urban Trendsetter',
    'Minimalist': 'The Clean Aesthete',
    'Bohemian': 'The Free Spirit',
    'Classic': 'The Timeless Sophisticate',
    'Edgy': 'The Bold Maverick',
    'Romantic': 'The Dreamy Romantic',
    'Athleisure': 'The Active Lifestyle Icon',
    'Business': 'The Power Professional',
    'Vintage': 'The Retro Connoisseur'
  };
  return types[style] || 'The Style Explorer';
}

module.exports = router;
