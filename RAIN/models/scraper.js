const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeAllRecipes(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const recipe = {};

    // Recipe Title
    recipe.name = $('h1').first().text().trim();

    // Nutrition Information
    const nutrition = {};

    $('.mm-recipes-nutrition-facts-summary__table tr').each((i, tr) => {
      const value = $(tr).find('td').first().text().trim();
      const name = $(tr).find('td').last().text().trim().toLowerCase();

      if (name === 'calories') nutrition.calories = value;
      if (name === 'fat') nutrition.fat = value;
      if (name === 'carbs') nutrition.carbs = value;
      if (name === 'protein') nutrition.protein = value;
    });

    recipe.nutrition = nutrition;

    return recipe;
  } catch (error) {
    console.error('Error scraping the recipe:', error.message);
    return null;
  }
}

module.exports = { scrapeAllRecipes };
