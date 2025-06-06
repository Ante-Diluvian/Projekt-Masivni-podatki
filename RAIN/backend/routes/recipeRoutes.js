//routes/recipeRoutes.js
const express = require('express');
const recipeController = require('../controllers/recipeController.js');

const router = express.Router();

//GET /api/recipes
router.get('/', recipeController.getAllRecipes);
router.get('/suggested', recipeController.getSuggestedRecipes);

//GET /api/recipes/:id
router.get('/:id', recipeController.getRecipeById);

module.exports = router;