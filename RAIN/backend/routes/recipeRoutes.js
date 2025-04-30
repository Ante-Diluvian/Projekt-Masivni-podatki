// routes/recipeRoutes.js
const express = require('express');
const Recipe = require('../models/Recipe'); // Model za recept, če boš shranjeval v bazo

const router = express.Router();

//POST /api/recipes (ustvari nov recept)
router.post('/', recipeController.createRecipe);

//GET /api/recipes (pridobi vse recepte)
router.get('/', recipeController.getAllRecipes);

//GET /api/recipes/:id (pridobi recept po ID-ju)
router.get('/:id', recipeController.getRecipeById);

module.exports = router;