const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function downloadImage(url, outputPath) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function extractAndDownloadMainImage($, folderPath = 'images') {
  const footer = $('div.loc.article-footer');
  const imageElement = footer.find('img.universal-image__image').first();
  const imageUrl = imageElement.attr('data-src') || imageElement.attr('src');

  if (!imageUrl) return null;

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const filename = path.basename(new URL(imageUrl).pathname);
  const fullPath = path.join(folderPath, filename);

  try {
    await downloadImage(imageUrl, fullPath);
    return fullPath;
  } catch (err) {
    console.error('Failed to download image:', err.message);
    return null;
  }
}

function extractMainImage($) {
  let bestImage = null;
  let maxWidth = 0;

  $('img.universal-image__image').each((i, el) => {
    const width = parseInt($(el).attr('width'), 10) || 0;
    const dataSrc = $(el).attr('data-src') || $(el).attr('src');
    if (width > maxWidth && dataSrc) {
      maxWidth = width;
      bestImage = dataSrc;
    }
  });

  return bestImage || null;
}

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

  recipe.instructions = [];

  $('#mm-recipes-steps__content_1-0 ol > li').each((i, li) => {
    const cloned = $(li).clone();

    cloned.find('figure').remove();

    const step = cloned.text().trim();
    if (step) {
      recipe.instructions.push(step);
    }
  });

  recipe.imagePath = await extractAndDownloadMainImage($, 'images');

  const details = {};
  const detailItems = $('.comp.mm-recipes-details .mm-recipes-details__item');

  const detailLabels = ['prepTime', 'cookTime', 'totalTime', 'servings'];

  detailItems.each((i, el) => {
    const value = $(el).find('.mm-recipes-details__value').text().trim();
    if (value && i < detailLabels.length) {
      details[detailLabels[i]] = value;
    }
  });

  recipe.details = details;


  return recipe;
  } catch (error) {
    console.error('Error scraping the recipe:', error.message);
    return null;
  }
}

module.exports = { scrapeAllRecipes };