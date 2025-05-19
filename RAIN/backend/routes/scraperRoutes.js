const express = require('express');
const { scrapeAllRecipes } = require('../models/scraper');
const recipeController = require('../controllers/recipeController');

const router = express.Router();

router.get('/', async (req, res) => {
    const { url } = req.query;
    if (!url) 
        return res.status(400).json({ error: 'Missing required query parameter: url' });

    try {
        //Start scraping
        const recipeData = await scrapeAllRecipes(url);
        if (!recipeData) 
            return res.status(500).json({ error: 'Failed to scrape recipe' });
        
        req.body = recipeData;
        await recipeController.createRecipe(req, res);
    } catch (err) {
        console.error('Error scraping and saving recipe:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

module.exports = router;