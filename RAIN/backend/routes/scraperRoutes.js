const express = require('express');
const { scrapeAllRecipes } = require('../scraper');
const Recipe = require('../models/Recipe');

const router = express.Router();

router.get('/scrape', async (req, res) => {
    const { url } = req.query;
    if (!url) 
        return res.status(400).json({ error: 'Missing required query parameter: url' });

    try {
        //Start scraping
        const recipeData = await scrapeAllRecipes(url);
        if (!recipeData) 
            return res.status(500).json({ error: 'Failed to scrape recipe' });
        
        const newRecipe = new Recipe({
            name: recipeData.name,
            nutrition: recipeData.nutrition,
            ingredients: recipeData.ingredients,
            instructions: recipeData.instructions,
        });

        res.json(newRecipe);
    } catch (err) {
        console.error('Error scraping and saving recipe:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

module.exports = router;