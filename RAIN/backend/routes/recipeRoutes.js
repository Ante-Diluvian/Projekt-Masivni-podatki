// routes/recipeRoutes.js
const express = require('express');
const recipeController = require('../controllers/recipeController.js');

const router = express.Router();

//POST /api/recipes
router.post('/', recipeController.createRecipe);

//GET /api/recipes
router.get('/', recipeController.getAllRecipes);

//GET /api/recipes/:id
router.get('/:id', recipeController.getRecipeById);

module.exports = router;