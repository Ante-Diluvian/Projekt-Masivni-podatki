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

    const ingredients = [];

    // Case 1: If ingredients have headings
  $('#mm-recipes-lrs-ingredients_1-0 .mm-recipes-structured-ingredients__list-heading').each((i, headingEl) => {
    const heading = $(headingEl).text().trim();
    const ul = $(headingEl).next('ul');
    const items = [];

    ul.find('.mm-recipes-structured-ingredients__list-item').each((j, itemEl) => {
      const itemText = $(itemEl).text().trim();
      if (itemText) items.push(itemText);
    });

    if (items.length) {
      ingredients.push({ heading, items });
    }
  });

  // Case 2: If there are no headings, get all ingredients from a flat list
  if (ingredients.length === 0) {
    $('#mm-recipes-lrs-ingredients_1-0 .mm-recipes-structured-ingredients__list .mm-recipes-structured-ingredients__list-item').each((i, itemEl) => {
      const itemText = $(itemEl).text().trim();
      if (itemText) {
        ingredients.push(itemText);
      }
    });
  }

  recipe.ingredients = ingredients;

    return recipe;
  } catch (error) {
    console.error('Error scraping the recipe:', error.message);
    return null;
  }
}

module.exports = { scrapeAllRecipes };
