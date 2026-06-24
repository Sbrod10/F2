const express = require('express');
let Anthropic = null;
try { Anthropic = require('@anthropic-ai/sdk'); } catch(e) {}
const multer = require('multer');
const { optionalAuth } = require('../middleware/auth');
const { users, userInteractions } = require('./auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const hasApiKey = !!(Anthropic && process.env.ANTHROPIC_API_KEY);
const client = hasApiKey ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

// Build personalization context from user history (ML component)
function buildUserContext(userId) {
  if (!userId || !users.has(userId)) return '';
  const user = users.get(userId);
  const interactions = userInteractions.get(userId) || [];

  if (interactions.length === 0 && user.stylePreferences.length === 0) return '';

  const recentSearches = interactions.slice(-10).map(i => i.query).filter(Boolean);
  const savedStyles = user.savedItems.slice(-5).map(i => i.style).filter(Boolean);
  const preferences = user.stylePreferences;

  let context = '\n\nUSER PERSONALIZATION CONTEXT (from machine learning history):\n';
  if (preferences.length > 0) context += `- Style preferences: ${preferences.join(', ')}\n`;
  if (recentSearches.length > 0) context += `- Recent searches: ${recentSearches.join(', ')}\n`;
  if (savedStyles.length > 0) context += `- Saved item styles: ${savedStyles.join(', ')}\n`;
  context += `- Total interactions: ${user.interactionCount || 0}\n`;

  return context;
}

// Record interaction for ML improvement
function recordInteraction(userId, data) {
  if (!userId) return;
  const interactions = userInteractions.get(userId) || [];
  interactions.push({ ...data, timestamp: new Date().toISOString() });
  userInteractions.set(userId, interactions.slice(-100)); // keep last 100

  if (users.has(userId)) {
    const user = users.get(userId);
    user.interactionCount = (user.interactionCount || 0) + 1;
  }
}

const { getDemoRecommendations, getDemoScanResult } = require('./demo');

// POST /api/ai/recommend - Get fashion recommendations from filters
router.post('/recommend', optionalAuth, async (req, res) => {
  if (!hasApiKey) return res.json(getDemoRecommendations(req.body));
  try {
    const {
      occasion, style, colors, budget, season, bodyType,
      materialPreference, ageRange, gender, additionalNotes
    } = req.body;

    const userId = req.user?.userId;
    const userContext = buildUserContext(userId);

    const prompt = `You are StyleComplex, an expert fashion stylist and trend forecaster. A user is looking for fashion recommendations.

USER PREFERENCES:
- Occasion: ${occasion || 'Not specified'}
- Style aesthetic: ${style || 'Not specified'}
- Preferred colors: ${Array.isArray(colors) ? colors.join(', ') : colors || 'No preference'}
- Budget range: ${budget || 'Flexible'}
- Season: ${season || 'All seasons'}
- Body type: ${bodyType || 'Not specified'}
- Material preference: ${materialPreference || 'No preference'}
- Age range: ${ageRange || 'Not specified'}
- Gender expression: ${gender || 'Not specified'}
- Additional notes: ${additionalNotes || 'None'}
${userContext}

Please provide exactly 4 outfit recommendations. For each, respond in this EXACT JSON format (no other text):
{
  "recommendations": [
    {
      "id": "1",
      "outfitName": "Outfit name here",
      "description": "2-3 sentence description of the complete look and why it works",
      "vibe": "One word vibe (e.g. Chic, Cozy, Edgy, Sophisticated)",
      "items": [
        {
          "type": "Item type (e.g. Top, Bottom, Shoes, Accessory)",
          "name": "Specific item name",
          "description": "Brief description",
          "estimatedPrice": "$XX - $XX",
          "searchQuery": "Exact search term to find this item online",
          "alternatives": ["budget-friendly alternative", "luxury alternative"]
        }
      ],
      "colorPalette": ["#hexcolor1", "#hexcolor2", "#hexcolor3"],
      "styleScore": 85,
      "occasions": ["occasion1", "occasion2"],
      "seasonality": "Season(s) this works for",
      "stylistTip": "One expert styling tip for this outfit"
    }
  ],
  "styleInsight": "A 2-sentence personalized style insight based on the user's preferences"
}`;

    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    const recommendations = JSON.parse(jsonMatch[0]);

    recordInteraction(userId, {
      type: 'recommendation',
      query: `${occasion} ${style} ${colors}`,
      filters: req.body
    });

    res.json({ success: true, ...recommendations, usage: message.usage });
  } catch (err) {
    console.error('AI recommend error:', err);
    res.status(500).json({ error: 'Failed to get recommendations', message: err.message });
  }
});

// POST /api/ai/scan-environment - Analyze photo and suggest fashion
router.post('/scan-environment', optionalAuth, upload.single('image'), async (req, res) => {
  if (!hasApiKey) return res.json(getDemoScanResult('rooftop-bar'));
  try {
    if (!req.file && !req.body.imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const userId = req.user?.userId;
    const userContext = buildUserContext(userId);

    let imageSource;
    if (req.file) {
      imageSource = {
        type: 'base64',
        media_type: req.file.mimetype,
        data: req.file.buffer.toString('base64')
      };
    } else {
      const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const mediaType = req.body.imageBase64.match(/data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';
      imageSource = { type: 'base64', media_type: mediaType, data: base64Data };
    }

    const prompt = `You are StyleComplex, an expert fashion consultant with deep knowledge of dress codes, environments, and style contexts.

Analyze this image and identify:
1. The environment/setting (restaurant, office, beach, club, outdoor, casual gathering, formal event, etc.)
2. The occasion type and formality level
3. Weather/climate indicators if visible
4. Cultural or geographic context clues
5. The overall vibe/mood of the place
${userContext}

Then provide fashion recommendations PERFECT for this specific environment. Respond in this EXACT JSON format only:
{
  "environmentAnalysis": {
    "setting": "Detected setting name",
    "formality": "casual/smart-casual/business-casual/semi-formal/formal/black-tie",
    "occasion": "Specific occasion type",
    "climate": "Detected or inferred climate",
    "vibe": "Overall vibe description",
    "confidence": 88,
    "details": "2-sentence description of what you see in the image"
  },
  "recommendations": [
    {
      "id": "1",
      "outfitName": "Outfit name",
      "description": "Why this outfit is perfect for this specific environment",
      "vibe": "Style vibe",
      "items": [
        {
          "type": "Item type",
          "name": "Item name",
          "description": "Description",
          "estimatedPrice": "$XX - $XX",
          "searchQuery": "Search term for online shopping",
          "alternatives": ["affordable option", "premium option"]
        }
      ],
      "colorPalette": ["#hex1", "#hex2", "#hex3"],
      "styleScore": 90,
      "whyItWorks": "Specific reason this works for the detected environment",
      "dressingTip": "Expert tip for this specific setting"
    }
  ],
  "fashionRules": "2-3 sentence fashion dos and don'ts specifically for this environment"
}`;

    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: imageSource },
          { type: 'text', text: prompt }
        ]
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    const result = JSON.parse(jsonMatch[0]);

    recordInteraction(userId, {
      type: 'environment_scan',
      setting: result.environmentAnalysis?.setting
    });

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('AI scan error:', err);
    res.status(500).json({ error: 'Failed to analyze environment', message: err.message });
  }
});

// POST /api/ai/analyze-outfit - Analyze an uploaded outfit image
router.post('/analyze-outfit', optionalAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file && !req.body.imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    let imageSource;
    if (req.file) {
      imageSource = { type: 'base64', media_type: req.file.mimetype, data: req.file.buffer.toString('base64') };
    } else {
      const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const mediaType = req.body.imageBase64.match(/data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';
      imageSource = { type: 'base64', media_type: mediaType, data: base64Data };
    }

    const prompt = `You are StyleComplex, a world-class fashion critic and stylist. Analyze this outfit image and provide detailed feedback.

Respond in this EXACT JSON format only:
{
  "outfitAnalysis": {
    "overallScore": 82,
    "styleCategory": "Category (e.g. Streetwear, Business Casual, Bohemian)",
    "occasion": "Best occasion for this outfit",
    "season": "Best season(s)",
    "strengths": ["strength1", "strength2", "strength3"],
    "improvements": ["improvement1", "improvement2"],
    "identifiedItems": [
      {
        "type": "Item type",
        "description": "What it looks like",
        "estimatedPrice": "$XX - $XX",
        "searchQuery": "How to find this online",
        "style": "Style descriptor"
      }
    ],
    "colorAnalysis": {
      "palette": ["#hex1", "#hex2"],
      "harmony": "Color harmony type",
      "rating": 85
    },
    "stylistVerdict": "2-3 sentence expert verdict on this outfit",
    "suggestions": "What to add or change to elevate this look"
  }
}`;

    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: imageSource },
          { type: 'text', text: prompt }
        ]
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    res.json({ success: true, ...JSON.parse(jsonMatch[0]) });
  } catch (err) {
    console.error('Outfit analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze outfit', message: err.message });
  }
});

// POST /api/ai/style-chat - AI style chat assistant
router.post('/style-chat', optionalAuth, async (req, res) => {
  if (!hasApiKey) {
    const demoReplies = [
      "Great question! For that look, I'd pair wide-leg trousers with a fitted top to balance proportions — and always add one statement piece to tie it together. 🎨",
      "That style is having a major moment right now! The key to nailing it is fit — everything should feel intentional, not accidental. Try thrifting for unique pieces.",
      "For your budget, I'd invest in 2-3 quality basics (a great blazer, dark-wash jeans, white sneakers) and use faster fashion for trendy accent pieces. Smart strategy! 💡",
      "Love the direction you're going! Switch to the Filter mode on the left and I'll generate full outfit recommendations with price comparisons across 12+ retailers. 🛍️",
      "Add your Anthropic API key in the .env file to unlock full AI chat! For now, try the Filter tab to see demo outfit recommendations. ✨"
    ];
    return res.json({ success: true, message: demoReplies[Math.floor(Math.random() * demoReplies.length)], role: 'assistant', demo: true });
  }
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user?.userId;
    const userContext = buildUserContext(userId);

    const systemPrompt = `You are StyleComplex, a friendly and expert AI fashion stylist. You help people find their perfect style, discover clothing items, and make fashion decisions. You're knowledgeable about trends, brands, price points, and styling techniques. Keep responses concise (under 150 words) but valuable.${userContext}`;

    const messages = [
      ...conversationHistory.slice(-6).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: systemPrompt,
      messages
    });

    recordInteraction(userId, { type: 'chat', query: message });

    res.json({ success: true, message: response.content[0].text, role: 'assistant' });
  } catch (err) {
    console.error('Style chat error:', err);
    res.status(500).json({ error: 'Chat failed', message: err.message });
  }
});

module.exports = router;
