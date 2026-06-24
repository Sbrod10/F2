const express = require('express');
const router = express.Router();

// Demo data — realistic mock responses used when no API key is set
function getDemoRecommendations(filters) {
  const { occasion = 'Casual', style = 'Casual', colors = [], budget = '$50 - $150' } = filters;

  const outfits = [
    {
      id: '1',
      outfitName: `${style} ${occasion} Look`,
      description: `A perfectly curated ${style.toLowerCase()} ensemble for ${occasion.toLowerCase()} occasions. This look balances comfort and style effortlessly with clean lines and versatile pieces.`,
      vibe: 'Chic',
      items: [
        { type: 'Top', name: 'Relaxed Linen Button-Down', description: 'Breathable and effortlessly stylish', estimatedPrice: '$35 - $65', searchQuery: 'relaxed linen button down shirt', alternatives: ['H&M linen shirt $25', 'Vince linen shirt $180'] },
        { type: 'Bottom', name: 'Straight-Leg Trousers', description: 'Tailored fit with a modern cut', estimatedPrice: '$45 - $90', searchQuery: 'straight leg trousers women', alternatives: ['Zara trousers $49', 'AG Jeans trousers $220'] },
        { type: 'Shoes', name: 'Minimalist Leather Loafers', description: 'Polished yet comfortable', estimatedPrice: '$60 - $120', searchQuery: 'minimalist leather loafers', alternatives: ['Amazon basics loafers $35', 'Tod\'s loafers $450'] },
        { type: 'Accessory', name: 'Structured Mini Tote', description: 'Clean silhouette, everyday functional', estimatedPrice: '$40 - $80', searchQuery: 'structured mini tote bag', alternatives: ['Walmart tote $18', 'Polene tote $280'] }
      ],
      colorPalette: ['#f5f0e8', '#c9b99a', '#3d3530'],
      styleScore: 91,
      occasions: [occasion, 'Brunch', 'Shopping'],
      seasonality: 'Spring/Summer',
      stylistTip: 'Tuck in just the front of the button-down for an intentional, put-together look without trying too hard.'
    },
    {
      id: '2',
      outfitName: 'Elevated Basics',
      description: 'Timeless pieces that work harder than they look. This combination uses neutral tones to create a sophisticated base that can be dressed up or down.',
      vibe: 'Minimalist',
      items: [
        { type: 'Top', name: 'Fitted Ribbed Tank', description: 'Sleek and versatile layering piece', estimatedPrice: '$18 - $40', searchQuery: 'fitted ribbed tank top', alternatives: ['SKIMS rib tank $28', 'Vince rib tank $95'] },
        { type: 'Jacket', name: 'Oversized Blazer', description: 'The cornerstone of any capsule wardrobe', estimatedPrice: '$55 - $140', searchQuery: 'oversized blazer women', alternatives: ['Shein blazer $22', 'Theory blazer $395'] },
        { type: 'Bottom', name: 'Wide-Leg Jeans', description: 'The season\'s most flattering silhouette', estimatedPrice: '$50 - $110', searchQuery: 'wide leg jeans', alternatives: ['H&M wide leg $35', 'Agolde jeans $228'] },
        { type: 'Shoes', name: 'White Leather Sneakers', description: 'The great equalizer of any outfit', estimatedPrice: '$55 - $120', searchQuery: 'white leather sneakers women', alternatives: ['New Balance 574 $85', 'Common Projects $490'] }
      ],
      colorPalette: ['#ffffff', '#1a1a1a', '#8b7355'],
      styleScore: 88,
      occasions: ['Casual', 'Brunch', 'City Exploring'],
      seasonality: 'All Season',
      stylistTip: 'Keep the blazer slightly open and push the sleeves up to the elbow — instantly more relaxed and editorial.'
    },
    {
      id: '3',
      outfitName: 'Weekend Effortless',
      description: 'The art of looking styled without effort. This combination proves that comfort and aesthetics are not mutually exclusive.',
      vibe: 'Cozy-Chic',
      items: [
        { type: 'Top', name: 'Oversized Knit Sweater', description: 'Chunky texture with soft drape', estimatedPrice: '$40 - $85', searchQuery: 'oversized knit sweater women', alternatives: ['Target knit $28', 'Toteme sweater $320'] },
        { type: 'Bottom', name: 'Barrel Leg Jeans', description: 'The silhouette of the moment', estimatedPrice: '$55 - $130', searchQuery: 'barrel leg jeans', alternatives: ['Zara barrel leg $49', 'Levi\'s $98'] },
        { type: 'Shoes', name: 'Platform Chelsea Boots', description: 'Adds height without sacrificing comfort', estimatedPrice: '$65 - $150', searchQuery: 'platform chelsea boots', alternatives: ['Steve Madden $89', 'Dr. Martens $180'] },
        { type: 'Accessory', name: 'Chunky Gold Hoops', description: 'The finishing touch that ties everything together', estimatedPrice: '$15 - $45', searchQuery: 'chunky gold hoop earrings', alternatives: ['Amazon gold hoops $12', 'Jennifer Fisher $195'] }
      ],
      colorPalette: ['#d4a574', '#2c2c2c', '#f0ebe3'],
      styleScore: 86,
      occasions: ['Weekend', 'Casual', 'Farmers Market'],
      seasonality: 'Fall/Winter',
      stylistTip: 'The barrel leg + chunky boot combo works best when you let the jeans hit the top of the boot — no stacking.'
    },
    {
      id: '4',
      outfitName: `${occasion} Night Statement`,
      description: 'A look designed to be remembered. Intentional, confident, and exactly right for the occasion without overdoing it.',
      vibe: 'Elevated',
      items: [
        { type: 'Top', name: 'Satin Slip Cami', description: 'Luxurious drape, effortlessly sexy', estimatedPrice: '$30 - $70', searchQuery: 'satin slip cami top', alternatives: ['Asos satin cami $22', 'Vince satin cami $145'] },
        { type: 'Bottom', name: 'Tailored Wide-Leg Pants', description: 'The power pant of the season', estimatedPrice: '$60 - $130', searchQuery: 'tailored wide leg pants', alternatives: ['Mango trousers $55', 'Jacquemus $390'] },
        { type: 'Jacket', name: 'Leather Moto Jacket', description: 'Edge meets sophistication', estimatedPrice: '$80 - $200', searchQuery: 'leather moto jacket', alternatives: ['H&M faux leather $59', 'AllSaints $350'] },
        { type: 'Shoes', name: 'Strappy Heeled Sandals', description: 'Delicate straps, major impact', estimatedPrice: '$55 - $130', searchQuery: 'strappy heeled sandals', alternatives: ['Schutz sandals $65', 'Jimmy Choo $650'] }
      ],
      colorPalette: ['#1a0a2e', '#c9a96e', '#f5e6c8'],
      styleScore: 94,
      occasions: [occasion, 'Date Night', 'Dinner'],
      seasonality: 'All Season',
      stylistTip: 'Let the satin cami be the hero — keep makeup bold (a red lip or graphic liner) and jewelry minimal.'
    }
  ];

  return {
    success: true,
    demo: true,
    recommendations: outfits,
    styleInsight: `Based on your ${style.toLowerCase()} aesthetic and ${occasion.toLowerCase()} focus, you gravitate toward looks that balance intentionality with comfort. To elevate your style further, invest in 2-3 quality basics that anchor multiple outfits.`
  };
}

function getDemoScanResult(scenario = 'rooftop-bar') {
  const scenarios = {
    'rooftop-bar': {
      environmentAnalysis: { setting: 'Rooftop Bar', formality: 'smart-casual', occasion: 'Evening Social', climate: 'Warm Evening', vibe: 'Trendy urban social scene with city views', confidence: 92, details: 'A chic rooftop venue with ambient lighting, cocktail tables, and a vibrant social atmosphere. The crowd is stylish but relaxed.' },
      fashionRules: 'Elevate above pure casual but avoid overdressing — this is a "look good, feel comfortable" zone. Heels are welcome but not required. Statement accessories shine here.',
      recommendations: [
        { id: '1', outfitName: 'Golden Hour Rooftop', vibe: 'Chic-Casual', styleScore: 93, description: 'Perfect for the rooftop: elevated enough to feel special, relaxed enough to enjoy drinks and conversation all night.', colorPalette: ['#c9a96e', '#1a1a2e', '#f5e6c8'], items: [ { type: 'Top', name: 'Off-Shoulder Satin Blouse', estimatedPrice: '$40 - $85' }, { type: 'Bottom', name: 'Tailored Linen Shorts', estimatedPrice: '$35 - $70' }, { type: 'Shoes', name: 'Block Heel Mules', estimatedPrice: '$55 - $110' }, { type: 'Accessory', name: 'Gold Chain Necklace Stack', estimatedPrice: '$20 - $60' } ], dressingTip: 'A satin top catches the golden hour light beautifully — perfect for photos and the vibe.' }
      ]
    },
    'beach': {
      environmentAnalysis: { setting: 'Beach', formality: 'casual', occasion: 'Beach Day', climate: 'Hot & Sunny', vibe: 'Relaxed coastal vacation energy', confidence: 96, details: 'A sunny beach with clear water and sand. Casual, vacation, and relaxed energy all around.' },
      fashionRules: 'Function meets style here — UV protection, sand-friendly fabrics, and easy on/off layers are key. Avoid anything you\'d be upset about getting wet or sandy.',
      recommendations: [
        { id: '1', outfitName: 'Beach Day Perfection', vibe: 'Coastal Cool', styleScore: 90, description: 'Effortlessly stylish while fully beach-functional. This look transitions from sand to boardwalk without missing a beat.', colorPalette: ['#87CEEB', '#F5DEB3', '#FFFFFF'], items: [ { type: 'Cover-Up', name: 'Crochet Sarong Cover-Up', estimatedPrice: '$25 - $60' }, { type: 'Swimwear', name: 'One-Shoulder Bikini Set', estimatedPrice: '$40 - $90' }, { type: 'Shoes', name: 'Woven Flatform Sandals', estimatedPrice: '$30 - $70' }, { type: 'Accessory', name: 'Oversized Straw Hat', estimatedPrice: '$20 - $50' } ], dressingTip: 'Pack a linen shirt in your bag for instant coverage when you move from beach to lunch.' }
      ]
    },
    'office': {
      environmentAnalysis: { setting: 'Corporate Office', formality: 'business-casual', occasion: 'Work Day', climate: 'Indoor / Air-conditioned', vibe: 'Professional, modern, and productive', confidence: 89, details: 'A modern open-plan office with natural light. Business-casual dress code with a creative, contemporary feel.' },
      fashionRules: 'Business-casual means polished from head to toe — no athletic wear, no exposed midriff, no overly casual graphics. Blazers are your best friend here.',
      recommendations: [
        { id: '1', outfitName: 'Power Monday', vibe: 'Professional', styleScore: 91, description: 'Commands respect without sacrificing comfort. This look says "I mean business" while still feeling entirely like you.', colorPalette: ['#2c3e50', '#ecf0f1', '#c9a96e'], items: [ { type: 'Top', name: 'Silk-Blend Button-Down', estimatedPrice: '$45 - $95' }, { type: 'Bottom', name: 'Tailored Straight-Leg Trousers', estimatedPrice: '$55 - $120' }, { type: 'Jacket', name: 'Structured Blazer', estimatedPrice: '$70 - $160' }, { type: 'Shoes', name: 'Block Heel Loafers', estimatedPrice: '$60 - $130' } ], dressingTip: 'Monochromatic tones in your trousers and blazer create an elongating, polished silhouette.' }
      ]
    },
    'wedding': {
      environmentAnalysis: { setting: 'Wedding Venue', formality: 'semi-formal', occasion: 'Wedding Guest', climate: 'Indoor Ballroom', vibe: 'Celebratory, elegant, and romantic', confidence: 88, details: 'A beautifully decorated wedding venue with floral arrangements, soft lighting, and formal table settings.' },
      fashionRules: 'Never wear white, ivory, or champagne. Avoid anything too revealing or casual. Midi and maxi lengths are safe bets. Metallics and jewel tones are perfect guest colors.',
      recommendations: [
        { id: '1', outfitName: 'Guest of Honor (Literally)', vibe: 'Romantic-Formal', styleScore: 95, description: 'Perfectly calibrated for a wedding guest: beautiful enough to honor the occasion, distinctive enough to be remembered, but never upstaging the couple.', colorPalette: ['#8B5CF6', '#F5E6C8', '#2C2C2C'], items: [ { type: 'Dress', name: 'Floral Midi Wrap Dress', estimatedPrice: '$60 - $140' }, { type: 'Shoes', name: 'Strappy Kitten Heel Sandals', estimatedPrice: '$55 - $120' }, { type: 'Bag', name: 'Embellished Satin Clutch', estimatedPrice: '$30 - $75' }, { type: 'Accessory', name: 'Pearl Drop Earrings', estimatedPrice: '$20 - $60' } ], dressingTip: 'A wrap dress is the most universally flattering silhouette — and you can adjust the neckline throughout the night.' }
      ]
    }
  };

  return { success: true, demo: true, ...(scenarios[scenario] || scenarios['rooftop-bar']) };
}

// GET /api/demo/recommendations
router.post('/recommendations', (req, res) => {
  res.json(getDemoRecommendations(req.body));
});

// GET /api/demo/scan/:scenario
router.get('/scan/:scenario', (req, res) => {
  res.json(getDemoScanResult(req.params.scenario));
});

// GET /api/demo/status
router.get('/status', (req, res) => {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  res.json({ hasApiKey: hasKey, mode: hasKey ? 'live' : 'demo' });
});

module.exports = router;
module.exports.getDemoRecommendations = getDemoRecommendations;
module.exports.getDemoScanResult = getDemoScanResult;
