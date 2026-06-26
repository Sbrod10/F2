const express = require('express');
const router = express.Router();

const COLOR_PALETTES = {
  black:   { hex: ['#1a1a1a', '#2c2c2c', '#f5f5f5'], name: 'Black', neutral: '#f5f5f5' },
  white:   { hex: ['#ffffff', '#f0ede8', '#1a1a1a'], name: 'White', neutral: '#1a1a1a' },
  navy:    { hex: ['#1b2a4a', '#2e4a7a', '#c9b99a'], name: 'Navy', neutral: '#c9b99a' },
  beige:   { hex: ['#f5f0e8', '#c9b99a', '#8b7355'], name: 'Beige', neutral: '#8b7355' },
  brown:   { hex: ['#6b4226', '#a0522d', '#f5e6c8'], name: 'Brown', neutral: '#f5e6c8' },
  green:   { hex: ['#2d5016', '#4a7c2f', '#e8f5e3'], name: 'Green', neutral: '#e8f5e3' },
  blue:    { hex: ['#1a4a7a', '#2e6eb5', '#e8f0fa'], name: 'Blue', neutral: '#e8f0fa' },
  red:     { hex: ['#8b0000', '#cc2200', '#f5e6e3'], name: 'Red', neutral: '#f5e6e3' },
  pink:    { hex: ['#e91e8c', '#f48cb0', '#fff0f5'], name: 'Pink', neutral: '#fff0f5' },
  purple:  { hex: ['#4a1a7a', '#7c3aed', '#f0e8ff'], name: 'Purple', neutral: '#f0e8ff' },
  grey:    { hex: ['#4a4a4a', '#9e9e9e', '#f5f5f5'], name: 'Grey', neutral: '#f5f5f5' },
  yellow:  { hex: ['#b8860b', '#f5c518', '#fffbe6'], name: 'Yellow', neutral: '#fffbe6' },
  orange:  { hex: ['#cc5500', '#e87722', '#fff3e8'], name: 'Orange', neutral: '#fff3e8' },
};

function getPalette(colors) {
  if (!colors || !colors.length) return COLOR_PALETTES.beige;
  const key = (Array.isArray(colors) ? colors[0] : colors).toLowerCase().replace(/[^a-z]/g, '');
  return COLOR_PALETTES[key] || COLOR_PALETTES.beige;
}

// Realistic base prices by item type
const ITEM_PRICES = {
  'Top':       { low: 28, mid: 55, high: 120 },
  'Bottom':    { low: 35, mid: 75, high: 160 },
  'Dress':     { low: 45, mid: 95, high: 220 },
  'Jacket':    { low: 60, mid: 130, high: 300 },
  'Shoes':     { low: 40, mid: 90, high: 200 },
  'Accessory': { low: 15, mid: 40, high: 95 },
  'Bag':       { low: 30, mid: 75, high: 200 },
  'Swimwear':  { low: 30, mid: 65, high: 140 },
  'Cover-Up':  { low: 25, mid: 55, high: 120 },
};

function priceRange(type, budget) {
  const b = budget || '$50 - $150';
  const isLow = b.includes('Under') || b.includes('25') || b.includes('50');
  const isHigh = b.includes('200') || b.includes('300') || b.includes('500') || b.includes('No');
  const p = ITEM_PRICES[type] || ITEM_PRICES['Top'];
  if (isLow) return `$${p.low} - $${p.mid}`;
  if (isHigh) return `$${p.mid} - $${p.high}`;
  return `$${Math.round((p.low + p.mid) / 2)} - $${p.mid}`;
}

function getDemoRecommendations(filters) {
  const { occasion = 'Casual', style = 'Casual', colors = [], budget = '$50 - $150', gender = '' } = filters;
  const palette = getPalette(colors);
  const colorName = palette.name;
  const [c1, c2, c3] = palette.hex;
  const isMen = gender && gender.toLowerCase().includes('men');

  const outfits = [
    {
      id: '1',
      outfitName: `${colorName} ${style} ${occasion} Look`,
      description: `A curated ${style.toLowerCase()} look built around your ${colorName.toLowerCase()} preference. Every piece reinforces the color story while staying true to the ${occasion.toLowerCase()} occasion.`,
      vibe: 'Chic',
      items: isMen ? [
        { type: 'Top', name: `${colorName} Oxford Button-Down`, description: 'Clean, structured, versatile', estimatedPrice: priceRange('Top', budget), searchQuery: `${colorName.toLowerCase()} oxford button down shirt men`, alternatives: [`H&M ${colorName.toLowerCase()} shirt $25`, `Ralph Lauren ${colorName.toLowerCase()} oxford $89`] },
        { type: 'Bottom', name: 'Slim-Fit Chinos', description: 'Modern tapered cut', estimatedPrice: priceRange('Bottom', budget), searchQuery: `slim fit chinos men ${colorName.toLowerCase()}`, alternatives: ['Uniqlo slim chinos $39', 'Bonobos chinos $98'] },
        { type: 'Shoes', name: 'Clean Leather Sneakers', description: 'Elevated casual footwear', estimatedPrice: priceRange('Shoes', budget), searchQuery: 'clean white leather sneakers men', alternatives: ['New Balance 574 $85', 'Common Projects $450'] },
        { type: 'Accessory', name: `${colorName} Minimalist Watch`, description: 'Completes the look', estimatedPrice: priceRange('Accessory', budget), searchQuery: 'minimalist watch men', alternatives: ['Casio $30', 'MVMT watch $95'] }
      ] : [
        { type: 'Top', name: `${colorName} Linen Button-Down`, description: 'Breathable and effortlessly stylish', estimatedPrice: priceRange('Top', budget), searchQuery: `${colorName.toLowerCase()} linen button down shirt women`, alternatives: [`H&M ${colorName.toLowerCase()} linen $28`, `Vince ${colorName.toLowerCase()} linen $180`] },
        { type: 'Bottom', name: 'Straight-Leg Trousers', description: 'Tailored fit with a modern cut', estimatedPrice: priceRange('Bottom', budget), searchQuery: `straight leg trousers women ${colorName.toLowerCase()}`, alternatives: ['Zara trousers $49', 'AG Jeans $220'] },
        { type: 'Shoes', name: 'Leather Loafers', description: 'Polished yet comfortable', estimatedPrice: priceRange('Shoes', budget), searchQuery: 'leather loafers women', alternatives: ['Amazon loafers $35', "Tod's loafers $450"] },
        { type: 'Bag', name: 'Structured Mini Tote', description: 'Clean silhouette, everyday functional', estimatedPrice: priceRange('Bag', budget), searchQuery: `structured mini tote bag ${colorName.toLowerCase()}`, alternatives: ['Walmart tote $18', 'Polene tote $280'] }
      ],
      colorPalette: [c1, c2, c3],
      styleScore: 91,
      occasions: [occasion, 'Brunch', 'Shopping'],
      seasonality: 'Spring/Summer',
      stylistTip: `${colorName} tones anchor this look — keep accessories in the same family for a cohesive finish.`
    },
    {
      id: '2',
      outfitName: `${colorName} Elevated Basics`,
      description: `Timeless pieces in a ${colorName.toLowerCase()} palette. This combination creates a sophisticated base that can be dressed up or down depending on the occasion.`,
      vibe: 'Minimalist',
      items: isMen ? [
        { type: 'Top', name: `${colorName} Crew Neck Tee`, description: 'Premium cotton, clean fit', estimatedPrice: priceRange('Top', budget), searchQuery: `${colorName.toLowerCase()} crew neck t-shirt men premium`, alternatives: ['UNIQLO supima tee $19', 'Everlane tee $35'] },
        { type: 'Jacket', name: 'Unstructured Blazer', description: 'Effortlessly polished', estimatedPrice: priceRange('Jacket', budget), searchQuery: `unstructured blazer men ${colorName.toLowerCase()}`, alternatives: ['Zara blazer $79', 'Theory blazer $395'] },
        { type: 'Bottom', name: 'Straight-Leg Dark Jeans', description: "Clean denim that doesn't crease", estimatedPrice: priceRange('Bottom', budget), searchQuery: 'straight leg dark jeans men', alternatives: ["Levi's 511 $59", 'AG jeans $195'] },
        { type: 'Shoes', name: 'Leather Derby Shoes', description: 'Versatile dress-casual hybrid', estimatedPrice: priceRange('Shoes', budget), searchQuery: 'leather derby shoes men', alternatives: ['Thursday Boot Co $149', 'Allen Edmonds $395'] }
      ] : [
        { type: 'Top', name: `${colorName} Ribbed Tank`, description: 'Sleek and versatile layering piece', estimatedPrice: priceRange('Top', budget), searchQuery: `${colorName.toLowerCase()} ribbed tank top women`, alternatives: ['SKIMS rib tank $28', 'Vince rib tank $95'] },
        { type: 'Jacket', name: 'Oversized Blazer', description: 'The cornerstone of any capsule wardrobe', estimatedPrice: priceRange('Jacket', budget), searchQuery: `oversized blazer women ${colorName.toLowerCase()}`, alternatives: ['Shein blazer $22', 'Theory blazer $395'] },
        { type: 'Bottom', name: 'Wide-Leg Jeans', description: "The season's most flattering silhouette", estimatedPrice: priceRange('Bottom', budget), searchQuery: 'wide leg jeans women', alternatives: ['H&M wide leg $35', 'Agolde jeans $228'] },
        { type: 'Shoes', name: `${colorName} Leather Sneakers`, description: 'The great equalizer of any outfit', estimatedPrice: priceRange('Shoes', budget), searchQuery: `${colorName.toLowerCase()} leather sneakers women`, alternatives: ['New Balance 574 $85', 'Common Projects $490'] }
      ],
      colorPalette: [c2, c1, c3],
      styleScore: 88,
      occasions: ['Casual', 'Brunch', 'City Exploring'],
      seasonality: 'All Season',
      stylistTip: 'Push the blazer sleeves to the elbow — instantly more relaxed and editorial.'
    },
    {
      id: '3',
      outfitName: `${colorName} Weekend Effortless`,
      description: `The art of looking styled without effort. ${colorName} tones give this casual combination a cohesive, intentional feel.`,
      vibe: 'Cozy-Chic',
      items: isMen ? [
        { type: 'Top', name: `${colorName} Oversized Hoodie`, description: 'Premium fleece, relaxed fit', estimatedPrice: priceRange('Top', budget), searchQuery: `${colorName.toLowerCase()} oversized hoodie men premium`, alternatives: ['Champion hoodie $45', 'Essentials hoodie $85'] },
        { type: 'Bottom', name: 'Tapered Cargo Pants', description: 'Functional and on-trend', estimatedPrice: priceRange('Bottom', budget), searchQuery: `tapered cargo pants men ${colorName.toLowerCase()}`, alternatives: ['H&M cargo $35', 'Dickies cargo $55'] },
        { type: 'Shoes', name: 'Chunky Skate Sneakers', description: 'Statement footwear that grounds the look', estimatedPrice: priceRange('Shoes', budget), searchQuery: 'chunky skate sneakers men', alternatives: ['Vans Old Skool $70', 'New Balance 550 $110'] },
        { type: 'Accessory', name: 'Structured Cap', description: 'Pulls the casual look together', estimatedPrice: priceRange('Accessory', budget), searchQuery: 'structured baseball cap men', alternatives: ['New Era cap $32', 'Carhartt cap $28'] }
      ] : [
        { type: 'Top', name: `${colorName} Oversized Knit Sweater`, description: 'Chunky texture with soft drape', estimatedPrice: priceRange('Top', budget), searchQuery: `${colorName.toLowerCase()} oversized knit sweater women`, alternatives: ['Target knit $28', 'Toteme sweater $320'] },
        { type: 'Bottom', name: 'Barrel Leg Jeans', description: 'The silhouette of the moment', estimatedPrice: priceRange('Bottom', budget), searchQuery: 'barrel leg jeans women', alternatives: ['Zara barrel leg $49', "Levi's $98"] },
        { type: 'Shoes', name: 'Platform Chelsea Boots', description: 'Adds height without sacrificing comfort', estimatedPrice: priceRange('Shoes', budget), searchQuery: 'platform chelsea boots women', alternatives: ['Steve Madden $89', 'Dr. Martens $180'] },
        { type: 'Accessory', name: 'Gold Hoop Earrings', description: 'The finishing touch', estimatedPrice: priceRange('Accessory', budget), searchQuery: 'chunky gold hoop earrings women', alternatives: ['Amazon gold hoops $12', 'Jennifer Fisher $195'] }
      ],
      colorPalette: [c1, c3, c2],
      styleScore: 86,
      occasions: ['Weekend', 'Casual', 'Farmers Market'],
      seasonality: 'Fall/Winter',
      stylistTip: `${colorName} works especially well when you mix textures — pair matte with sheen for depth.`
    },
    {
      id: '4',
      outfitName: `${colorName} ${occasion} Statement`,
      description: `A look designed to be remembered. ${colorName} tones make this intentional and confident — exactly right for ${occasion.toLowerCase()} without overdoing it.`,
      vibe: 'Elevated',
      items: isMen ? [
        { type: 'Top', name: `${colorName} Dress Shirt`, description: 'Crisp, fitted, versatile', estimatedPrice: priceRange('Top', budget), searchQuery: `${colorName.toLowerCase()} dress shirt men fitted`, alternatives: ['Express shirt $49', 'Charles Tyrwhitt $75'] },
        { type: 'Bottom', name: 'Tailored Trousers', description: 'Clean break at the ankle', estimatedPrice: priceRange('Bottom', budget), searchQuery: `tailored trousers men ${colorName.toLowerCase()}`, alternatives: ['Banana Republic $79', 'Suitsupply $149'] },
        { type: 'Jacket', name: 'Slim Fit Blazer', description: 'Sharp, modern silhouette', estimatedPrice: priceRange('Jacket', budget), searchQuery: `slim fit blazer men ${colorName.toLowerCase()}`, alternatives: ['H&M blazer $59', 'Suitsupply $299'] },
        { type: 'Shoes', name: 'Oxford Dress Shoes', description: 'The foundation of any formal look', estimatedPrice: priceRange('Shoes', budget), searchQuery: 'oxford dress shoes men leather', alternatives: ['Steve Madden $79', 'Johnston Murphy $175'] }
      ] : [
        { type: 'Top', name: `${colorName} Satin Slip Cami`, description: 'Luxurious drape, effortlessly elegant', estimatedPrice: priceRange('Top', budget), searchQuery: `${colorName.toLowerCase()} satin slip cami top women`, alternatives: ['Asos satin cami $22', 'Vince satin cami $145'] },
        { type: 'Bottom', name: 'Tailored Wide-Leg Pants', description: 'The power pant of the season', estimatedPrice: priceRange('Bottom', budget), searchQuery: `tailored wide leg pants women ${colorName.toLowerCase()}`, alternatives: ['Mango trousers $55', 'Jacquemus $390'] },
        { type: 'Jacket', name: 'Leather Moto Jacket', description: 'Edge meets sophistication', estimatedPrice: priceRange('Jacket', budget), searchQuery: 'leather moto jacket women', alternatives: ['H&M faux leather $59', 'AllSaints $350'] },
        { type: 'Shoes', name: 'Strappy Heeled Sandals', description: 'Delicate straps, major impact', estimatedPrice: priceRange('Shoes', budget), searchQuery: 'strappy heeled sandals women', alternatives: ['Schutz sandals $65', 'Jimmy Choo $650'] }
      ],
      colorPalette: [c1, c2, c3],
      styleScore: 94,
      occasions: [occasion, 'Date Night', 'Dinner'],
      seasonality: 'All Season',
      stylistTip: `Let ${colorName.toLowerCase()} be the hero — keep one piece bold and let the rest support it.`
    }
  ];

  const colorDesc = colors && colors.length ? `${colorName.toLowerCase()}-focused ` : '';
  return {
    success: true,
    demo: true,
    recommendations: outfits,
    styleInsight: `Based on your ${colorDesc}${style.toLowerCase()} aesthetic and ${occasion.toLowerCase()} focus, you gravitate toward intentional looks that balance comfort and style. To elevate further, invest in 2-3 quality basics in your core ${colorName.toLowerCase()} palette that anchor multiple outfits.`
  };
}

function getDemoScanResult(scenario = 'rooftop-bar') {
  const scenarios = {
    'rooftop-bar': {
      environmentAnalysis: { setting: 'Rooftop Bar', formality: 'smart-casual', occasion: 'Evening Social', climate: 'Warm Evening', vibe: 'Trendy urban social scene with city views', confidence: 92, details: 'A chic rooftop venue with ambient lighting, cocktail tables, and a vibrant social atmosphere. The crowd is stylish but relaxed.' },
      fashionRules: 'Elevate above pure casual but avoid overdressing — this is a "look good, feel comfortable" zone.',
      recommendations: [
        { id: '1', outfitName: 'Golden Hour Rooftop', vibe: 'Chic-Casual', styleScore: 93, description: 'Elevated enough to feel special, relaxed enough to enjoy drinks all night.', colorPalette: ['#c9a96e', '#1a1a2e', '#f5e6c8'], items: [ { type: 'Top', name: 'Off-Shoulder Satin Blouse', estimatedPrice: '$40 - $85', searchQuery: 'off shoulder satin blouse women evening' }, { type: 'Bottom', name: 'Tailored Linen Shorts', estimatedPrice: '$35 - $70', searchQuery: 'tailored linen shorts women' }, { type: 'Shoes', name: 'Block Heel Mules', estimatedPrice: '$55 - $110', searchQuery: 'block heel mules women' }, { type: 'Accessory', name: 'Gold Chain Necklace', estimatedPrice: '$20 - $60', searchQuery: 'gold chain necklace women layered' } ], dressingTip: 'A satin top catches the golden hour light beautifully.' }
      ]
    },
    'beach': {
      environmentAnalysis: { setting: 'Beach', formality: 'casual', occasion: 'Beach Day', climate: 'Hot & Sunny', vibe: 'Relaxed coastal vacation energy', confidence: 96, details: 'A sunny beach with clear water and sand.' },
      fashionRules: 'Function meets style — UV protection, sand-friendly fabrics, and easy layers are key.',
      recommendations: [
        { id: '1', outfitName: 'Beach Day Perfection', vibe: 'Coastal Cool', styleScore: 90, description: 'Effortlessly stylish while fully beach-functional.', colorPalette: ['#87CEEB', '#F5DEB3', '#FFFFFF'], items: [ { type: 'Cover-Up', name: 'Crochet Sarong Cover-Up', estimatedPrice: '$25 - $60', searchQuery: 'crochet sarong cover up beach women' }, { type: 'Swimwear', name: 'One-Shoulder Bikini Set', estimatedPrice: '$40 - $90', searchQuery: 'one shoulder bikini set women' }, { type: 'Shoes', name: 'Woven Flatform Sandals', estimatedPrice: '$30 - $70', searchQuery: 'woven flatform sandals women beach' }, { type: 'Accessory', name: 'Oversized Straw Hat', estimatedPrice: '$20 - $50', searchQuery: 'oversized straw hat beach women' } ], dressingTip: 'Pack a linen shirt for instant coverage when moving from beach to lunch.' }
      ]
    },
    'office': {
      environmentAnalysis: { setting: 'Corporate Office', formality: 'business-casual', occasion: 'Work Day', climate: 'Indoor / Air-conditioned', vibe: 'Professional, modern, productive', confidence: 89, details: 'A modern open-plan office with natural light and business-casual dress code.' },
      fashionRules: 'Polished from head to toe — blazers are your best friend here.',
      recommendations: [
        { id: '1', outfitName: 'Power Monday', vibe: 'Professional', styleScore: 91, description: 'Commands respect without sacrificing comfort.', colorPalette: ['#2c3e50', '#ecf0f1', '#c9a96e'], items: [ { type: 'Top', name: 'Silk-Blend Button-Down', estimatedPrice: '$45 - $95', searchQuery: 'silk blend button down shirt women office' }, { type: 'Bottom', name: 'Tailored Straight-Leg Trousers', estimatedPrice: '$55 - $120', searchQuery: 'tailored straight leg trousers women work' }, { type: 'Jacket', name: 'Structured Blazer', estimatedPrice: '$70 - $160', searchQuery: 'structured blazer women office' }, { type: 'Shoes', name: 'Block Heel Loafers', estimatedPrice: '$60 - $130', searchQuery: 'block heel loafers women office' } ], dressingTip: 'Monochromatic tones in trousers and blazer create an elongating silhouette.' }
      ]
    },
    'wedding': {
      environmentAnalysis: { setting: 'Wedding Venue', formality: 'semi-formal', occasion: 'Wedding Guest', climate: 'Indoor Ballroom', vibe: 'Celebratory, elegant, romantic', confidence: 88, details: 'A beautifully decorated wedding venue with floral arrangements and soft lighting.' },
      fashionRules: 'Never wear white, ivory, or champagne. Midi and maxi lengths are safe bets. Metallics and jewel tones are perfect.',
      recommendations: [
        { id: '1', outfitName: 'Guest of Honor', vibe: 'Romantic-Formal', styleScore: 95, description: 'Beautiful enough to honor the occasion, distinctive enough to be remembered.', colorPalette: ['#8B5CF6', '#F5E6C8', '#2C2C2C'], items: [ { type: 'Dress', name: 'Floral Midi Wrap Dress', estimatedPrice: '$60 - $140', searchQuery: 'floral midi wrap dress women wedding guest' }, { type: 'Shoes', name: 'Strappy Kitten Heel Sandals', estimatedPrice: '$55 - $120', searchQuery: 'strappy kitten heel sandals women wedding' }, { type: 'Bag', name: 'Embellished Satin Clutch', estimatedPrice: '$30 - $75', searchQuery: 'embellished satin clutch bag wedding' }, { type: 'Accessory', name: 'Pearl Drop Earrings', estimatedPrice: '$20 - $60', searchQuery: 'pearl drop earrings women formal' } ], dressingTip: 'A wrap dress is the most universally flattering silhouette.' }
      ]
    }
  };

  return { success: true, demo: true, ...(scenarios[scenario] || scenarios['rooftop-bar']) };
}

router.post('/recommendations', (req, res) => res.json(getDemoRecommendations(req.body)));
router.get('/scan/:scenario', (req, res) => res.json(getDemoScanResult(req.params.scenario)));
router.get('/status', (req, res) => {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  res.json({ hasApiKey: hasKey, mode: hasKey ? 'live' : 'demo' });
});

module.exports = router;
module.exports.getDemoRecommendations = getDemoRecommendations;
module.exports.getDemoScanResult = getDemoScanResult;
