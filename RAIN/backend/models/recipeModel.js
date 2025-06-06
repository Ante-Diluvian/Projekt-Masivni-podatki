const mongoose = require('mongoose');

const IngredientSectionSchema = new mongoose.Schema({
  heading: { type: String, required: false },
  items: [{ type: String }]
});

const NutritionSchema = new mongoose.Schema({
  calories: { type: String },
  fat: { type: String },
  carbs: { type: String },
  protein: { type: String }
});

const RecipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nutrition: { type: NutritionSchema },
  ingredients: {
    type: [mongoose.Schema.Types.Mixed],
    required: true
  },
  instructions: [{ type: String, required: true }],
  imagePath: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('Recipe', RecipeSchema);
