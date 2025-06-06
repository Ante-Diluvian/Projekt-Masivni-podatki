var Recipe = require('../models/recipeModel.js');

/**
 * recipeController.js
 *
 * @description :: Server-side logic for managing recipes.
 */
module.exports = {
    createRecipe: function (req, res) {
        try {
            const { name, nutrition, ingredients, instructions, imagePath } = req.body;

            //Check if all required fields are present
            const missing = [];
            if (!name) 
                missing.push('name');
            if (!ingredients) 
                missing.push('ingredients');
            if (!instructions) 
                missing.push('instructions');
            if (missing.length) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    missingFields: missing
                });
            }
            
            //Create a new recipe
            const newRecipe = new Recipe({
                name,
                nutrition,
                ingredients,
                instructions,
                imagePath
            });

            //Save
            newRecipe.save((err, newRecipe) => {
                if (err) {
                    console.error('Error saving recipe:', err);
                    return res.status(500).json({ error: 'Internal server error', details: err.message });
                }

                return res.status(201).json(newRecipe);
            });
        } catch (err) {
            console.error('Error creating recipe:', err);
            res.status(500).json({ error: 'Internal server error', details: err.message });
        }
    },

    getAllRecipes: async function (req, res) {
        try {
            const recipes = await Recipe.find();
            res.status(200).json(recipes);
        } catch (err) {
            console.error('Error fetching recipes:', err);
            res.status(500).json({ error: 'Internal server error', details: err.message });
        }
    },

    getSuggestedRecipes: async function (req, res) {
        try {
            const maxCalories = req.query.maxCalories ? parseInt(req.query.maxCalories, 10) : null;

            const allRecipes = await Recipe.find().limit(50);

            if (maxCalories === null || isNaN(maxCalories))
                return res.json(allRecipes);

            const extractCalories = (calStr) => {
                if (!calStr) 
                    return 0;
                
                const match = calStr.match(/\d+/);
                return match ? parseInt(match[0], 10) : 0;
            };

            const filteredRecipes = allRecipes.filter(recipe => {
                const cals = extractCalories(recipe.nutrition?.calories);
                return cals <= maxCalories;
            });

            res.json(filteredRecipes);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getRecipeById: async function (req, res) {
        try {
            const recipe = await Recipe.findById(req.params.id);

            if (!recipe) 
                return res.status(404).json({ error: 'Recipe not found' });
            
            res.status(200).json(recipe);
        } catch (err) {
            console.error('Error fetching recipe by ID:', err);
            res.status(500).json({ error: 'Internal server error', details: err.message });
        }
    }
};