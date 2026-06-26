const express = require('express');
const https = require('https');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

const hasSerpApi = !!process.env.SERP_API_KEY;

// Fallback retailer search URLs (used when no SerpAPI key)
const RETAILERS = [
  { name: 'ASOS', searchUrl: 'https://www.asos.com/us/search/?q={q}', priceModifier: 1.0, badge: 'Free Returns', logo: '🛍️' },
  { name: 'Zara', searchUrl: 'https://www.zara.com/us/en/search?searchTerm={q}', priceModifier: 1.2, badge: 'Trending', logo: '✨' },
  { name: 'H&M', searchUrl: 'https://www2.hm.com/en_us/search-results.html?q={q}', priceModifier: 0.7, badge: 'Budget Pick', logo: '💚' },
  { name: 'Nordstrom', searchUrl: 'https://www.nordstrom.com/sr?origin=keywordsearch&keyword={q}', priceModifier: 2.2, badge: 'Premium', logo: '⭐' },
  { name: "Macy's", searchUrl: 'https://www.macys.com/shop/featured/{q}', priceModifier: 1.5, badge: 'Sale Often', logo: '🏪' },
  { name: 'Shein', searchUrl: 'https://www.shein.com/search?q={q}', priceModifier: 0.3, badge: 'Lowest Price', logo: '💰' },
  { name: 'Urban Outfitters', searchUrl: 'https://www.urbanoutfitters.com/search?q={q}', priceModifier: 1.4, badge: 'Trendy', logo: '🎨' },
  { name: 'Forever 21', searchUrl: 'https://www.forever21.com/us/shop/catalog/category/f21/search?q={q}', priceModifier: 0.5, badge: 'Value', logo: '🌟' },
  { name: 'Revolve', searchUrl: 'https://www.revolve.com/r/Search.jsp?q={q}', priceModifier: 1.8, badge: 'Influencer Fav', logo: '📸' },
  { name: 'SSENSE', searchUrl: 'https://www.ssense.com/en-us/search?q={q}', priceModifier: 3.5, badge: 'Luxury', logo: '💎' },
  { name: 'PrettyLittleThing', searchUrl: 'https://www.prettylittlething.us/catalogsearch/result/?q={q}', priceModifier: 0.45, badge: 'Fast Fashion', logo: '🌸' },
  { name: 'Anthropologie', searchUrl: 'https://www.anthropologie.com/search?q={q}', priceModifier: 1.9, badge: 'Boho Chic', logo: '🌿' }
];

// Call SerpAPI Google Shopping — returns real product links with images
function fetchRealProducts(query) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: query,
      api_key: process.env.SERP_API_KEY,
      num: '10',
      gl: 'us',
      hl: 'en'
    });

    const req = https.request({
      hostname: 'serpapi.com',
      path: `/search?${params.toString()}`,
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('SerpAPI parse error'));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function parseBasePrice(priceStr) {
  const match = priceStr?.match(/\$(\d+)/);
  return match ? parseInt(match[1]) : 50;
}

// Convert SerpAPI shopping_results into our retailer card format
function mapSerpResults(serpData, query) {
  const results = serpData.shopping_results || [];
  return results.slice(0, 8).map((item, i) => {
    const price = parseBasePrice(item.price);
    const originalPrice = item.was_price ? parseBasePrice(item.was_price) : null;
    const discount = originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

    return {
      retailer: item.source || 'Shop',
      logo: '🛍️',
      badge: discount ? `${discount}% OFF` : (i === 0 ? 'Top Result' : ''),
      url: item.link,
      price: item.price || `$${price}`,
      originalPrice: item.was_price || null,
      discount: discount ? `${discount}% OFF` : null,
      rating: item.rating ? parseFloat(item.rating) : null,
      reviews: item.reviews || null,
      inStock: true,
      shipping: 'Check site for shipping',
      deliveryDays: null,
      thumbnail: item.thumbnail || null,
      title: item.title,
      realLink: true
    };
  });
}

function generateRetailerResults(itemName, itemType, priceRange) {
  const basePrice = parseBasePrice(priceRange);
  const shuffled = [...RETAILERS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 6);

  return selected.map(retailer => {
    const price = Math.round(basePrice * retailer.priceModifier * (0.85 + Math.random() * 0.3));
    const originalPrice = Math.random() > 0.5 ? Math.round(price * (1.2 + Math.random() * 0.4)) : null;
    const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null;
    const rating = (3.5 + Math.random() * 1.5).toFixed(1);
    const reviews = Math.floor(50 + Math.random() * 5000);
    const inStock = Math.random() > 0.15;
    const shipping = price > 50 ? 'Free shipping' : `$${Math.floor(4 + Math.random() * 8)} shipping`;

    return {
      retailer: retailer.name,
      logo: retailer.logo,
      badge: retailer.badge,
      url: retailer.searchUrl.replace('{q}', encodeURIComponent(itemName)),
      price: `$${price}`,
      originalPrice: originalPrice ? `$${originalPrice}` : null,
      discount: discount ? `${discount}% OFF` : null,
      rating: parseFloat(rating),
      reviews,
      inStock,
      shipping,
      deliveryDays: Math.floor(2 + Math.random() * 7),
      thumbnail: null,
      realLink: false
    };
  }).sort((a, b) => parseBasePrice(a.price) - parseBasePrice(b.price));
}

function generateSimilarItems(itemName, itemType, priceRange) {
  const basePrice = parseBasePrice(priceRange);

  const typeVariants = {
    'Top': ['Blouse', 'Shirt', 'Sweater', 'Crop Top', 'Tank Top', 'Turtleneck'],
    'Bottom': ['Jeans', 'Trousers', 'Skirt', 'Shorts', 'Leggings', 'Wide-leg Pants'],
    'Shoes': ['Sneakers', 'Boots', 'Sandals', 'Loafers', 'Heels', 'Mules'],
    'Jacket': ['Blazer', 'Denim Jacket', 'Trench Coat', 'Bomber', 'Cardigan', 'Vest'],
    'Dress': ['Midi Dress', 'Maxi Dress', 'Mini Dress', 'Wrap Dress', 'Slip Dress', 'Bodycon'],
    'Accessory': ['Belt', 'Bag', 'Hat', 'Scarf', 'Jewelry', 'Sunglasses']
  };

  const adjectives = ['Vintage-inspired', 'Modern', 'Classic', 'Oversized', 'Fitted', 'Relaxed', 'Structured', 'Flowy'];
  const materials = ['Cotton', 'Linen', 'Denim', 'Silk-blend', 'Knit', 'Satin', 'Tweed', 'Velvet'];

  const variants = typeVariants[itemType] || typeVariants['Top'];
  const selectedVariants = variants.sort(() => Math.random() - 0.5).slice(0, 4);

  return selectedVariants.map((variant, i) => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const material = materials[Math.floor(Math.random() * materials.length)];
    const priceMultiplier = [0.4, 0.7, 1.3, 2.0][i];
    const price = Math.round(basePrice * priceMultiplier);
    const retailer = RETAILERS[Math.floor(Math.random() * RETAILERS.length)];

    return {
      id: `similar_${i}`,
      name: `${adj} ${material} ${variant}`,
      type: itemType,
      price: `$${price}`,
      priceCategory: price < 30 ? 'budget' : price < 80 ? 'mid-range' : price < 200 ? 'premium' : 'luxury',
      retailer: retailer.name,
      retailerUrl: retailer.searchUrl.replace('{q}', encodeURIComponent(variant)),
      rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      description: `A ${adj.toLowerCase()} take on the ${variant.toLowerCase()} with ${material.toLowerCase()} construction`,
      whyItsSimilar: `Same ${itemType.toLowerCase()} category with comparable style and functionality`
    };
  });
}

// POST /api/search/prices - Search for item prices across retailers
router.post('/prices', optionalAuth, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array required' });
    }

    const results = await Promise.all(items.map(async item => {
      let retailers;

      if (hasSerpApi) {
        try {
          const serpData = await fetchRealProducts(item.searchQuery || item.name);
          retailers = mapSerpResults(serpData, item.searchQuery || item.name);
          if (retailers.length === 0) throw new Error('No results');
        } catch (e) {
          console.error('SerpAPI failed, using fallback:', e.message);
          retailers = generateRetailerResults(item.name, item.type, item.estimatedPrice);
        }
      } else {
        retailers = generateRetailerResults(item.name, item.type, item.estimatedPrice);
      }

      return {
        item: item.name,
        type: item.type,
        retailers,
        similarItems: generateSimilarItems(item.name, item.type, item.estimatedPrice),
        searchQuery: item.searchQuery,
        realLinks: hasSerpApi,
        lastUpdated: new Date().toISOString()
      };
    }));

    const allPrices = results.flatMap(r => r.retailers.map(ret => parseBasePrice(ret.price)));
    const totalMin = results.reduce((sum, r) => {
      const prices = r.retailers.map(ret => parseBasePrice(ret.price));
      return sum + Math.min(...prices);
    }, 0);

    res.json({
      success: true,
      results,
      realLinks: hasSerpApi,
      summary: {
        totalItems: items.length,
        cheapestOutfitTotal: `$${totalMin}`,
        searchedRetailers: hasSerpApi ? 'Google Shopping' : RETAILERS.length
      }
    });
  } catch (err) {
    console.error('Price search error:', err);
    res.status(500).json({ error: 'Price search failed', message: err.message });
  }
});

// GET /api/search/trending - Get trending fashion items
router.get('/trending', async (req, res) => {
  const trending = [
    { name: 'Barrel Leg Jeans', category: 'Bottoms', trend: '+240%', price: '$45 - $120', emoji: '👖' },
    { name: 'Ballet Flats', category: 'Shoes', trend: '+185%', price: '$30 - $200', emoji: '🩰' },
    { name: 'Oversized Blazer', category: 'Outerwear', trend: '+132%', price: '$60 - $280', emoji: '🧥' },
    { name: 'Mesh Tops', category: 'Tops', trend: '+210%', price: '$15 - $80', emoji: '✨' },
    { name: 'Wide-leg Trousers', category: 'Bottoms', trend: '+167%', price: '$40 - $150', emoji: '👔' },
    { name: 'Platform Sandals', category: 'Shoes', trend: '+143%', price: '$35 - $180', emoji: '👡' },
    { name: 'Linen Sets', category: 'Sets', trend: '+198%', price: '$55 - $200', emoji: '🌿' },
    { name: 'Cargo Pants', category: 'Bottoms', trend: '+156%', price: '$45 - $130', emoji: '🪖' }
  ];

  res.json({ success: true, trending, updatedAt: new Date().toISOString() });
});

module.exports = router;
