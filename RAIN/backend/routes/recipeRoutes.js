const express = require('express');
const { scrapeAllRecipes } = require('../scraper');

const router = express.Router();

//GET /api/recipes
router.get('/', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing required query parameter: url' });
  }

  try {
    const recipe = await scrapeAllRecipes(url);

    if (!recipe) 
        return res.status(500).json({ error: 'Failed to scrape recipe' });
    
    res.json(recipe);
  } catch (err) {
    console.error('Error in /api/recipes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;