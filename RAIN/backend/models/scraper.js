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

/**
 * Parse ISO 8601 duration to readable format
 * PT1H30M -> "1 hr 30 mins"
 */
function parseISODuration(duration) {
  if (!duration) return null;
  
  // Already human readable
  if (!duration.startsWith('PT')) return duration;
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;
  
  const parts = [];
  if (match[1]) parts.push(`${match[1]} hr`);
  if (match[2]) parts.push(`${match[2]} mins`);
  if (match[3]) parts.push(`${match[3]} sec`);
  
  return parts.join(' ') || null;
}

async function scrapeAllRecipes(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    const $ = cheerio.load(data);

    // Try to find JSON-LD structured data first
    let recipeData = null;
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const json = JSON.parse($(el).html());
        
        // Can be array, object, or have @graph
        let items = [];
        if (Array.isArray(json)) {
          items = json;
        } else if (json['@graph']) {
          items = json['@graph'];
        } else {
          items = [json];
        }
        
        for (const item of items) {
          if (item['@type'] === 'Recipe' || 
              (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))) {
            recipeData = item;
            break;
          }
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    });

    const recipe = {};

    if (recipeData) {
      // === JSON-LD parsing (preferred) ===
      
      // Name
      recipe.name = recipeData.name || '';

      // Ingredients
      recipe.ingredients = recipeData.recipeIngredient || [];

      // Instructions
      recipe.instructions = [];
      if (recipeData.recipeInstructions) {
        for (const step of recipeData.recipeInstructions) {
          if (typeof step === 'string') {
            recipe.instructions.push(step);
          } else if (step.text) {
            recipe.instructions.push(step.text);
          } else if (step.itemListElement) {
            // Nested HowToSection
            for (const subStep of step.itemListElement) {
              if (subStep.text) {
                recipe.instructions.push(subStep.text);
              }
            }
          }
        }
      }

      // Nutrition
      recipe.nutrition = {};
      if (recipeData.nutrition) {
        const n = recipeData.nutrition;
        if (n.calories) recipe.nutrition.calories = n.calories.replace(/\D/g, '');
        if (n.fatContent) recipe.nutrition.fat = n.fatContent.replace(/\D/g, '');
        if (n.carbohydrateContent) recipe.nutrition.carbs = n.carbohydrateContent.replace(/\D/g, '');
        if (n.proteinContent) recipe.nutrition.protein = n.proteinContent.replace(/\D/g, '');
        if (n.sodiumContent) recipe.nutrition.sodium = n.sodiumContent.replace(/\D/g, '');
        if (n.fiberContent) recipe.nutrition.fiber = n.fiberContent.replace(/\D/g, '');
        if (n.sugarContent) recipe.nutrition.sugar = n.sugarContent.replace(/\D/g, '');
        if (n.cholesterolContent) recipe.nutrition.cholesterol = n.cholesterolContent.replace(/\D/g, '');
      }

      // Details
      recipe.details = {
        prepTime: parseISODuration(recipeData.prepTime),
        cookTime: parseISODuration(recipeData.cookTime),
        totalTime: parseISODuration(recipeData.totalTime),
        servings: recipeData.recipeYield ? 
          (Array.isArray(recipeData.recipeYield) ? recipeData.recipeYield[0] : recipeData.recipeYield) : null
      };

      // Image
      let imageUrl = null;
      if (recipeData.image) {
        if (typeof recipeData.image === 'string') {
          imageUrl = recipeData.image;
        } else if (recipeData.image.url) {
          imageUrl = recipeData.image.url;
        } else if (Array.isArray(recipeData.image)) {
          imageUrl = recipeData.image[0]?.url || recipeData.image[0];
        }
      }

      // Download image
      recipe.imagePath = null;
      recipe.imageUrl = imageUrl;
      
      if (imageUrl) {
        const folderPath = 'images';
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
        try {
          let filename = `recipe_${Date.now()}.jpg`;
          try {
            const urlObj = new URL(imageUrl);
            const baseName = path.basename(urlObj.pathname);
            if (baseName && path.extname(baseName)) {
              filename = baseName;
            }
          } catch {}
          
          const fullPath = path.join(folderPath, filename);
          await downloadImage(imageUrl, fullPath);
          recipe.imagePath = fullPath;
        } catch (err) {
          console.error('Failed to download image:', err.message);
        }
      }

    } else {
      // === Fallback: HTML parsing ===
      console.log('No JSON-LD found, falling back to HTML parsing');
      
      // Recipe Title
      recipe.name = $('h1').first().text().trim() || $('title').text().split(' - ')[0].trim();

      // Ingredients - try multiple selectors
      recipe.ingredients = [];
      const ingredientSelectors = [
        '.mm-recipes-structured-ingredients__list-item',
        '.mntl-structured-ingredients__list-item',
        '[data-ingredient]',
        '.ingredient',
        '.ingredients li'
      ];
      
      for (const selector of ingredientSelectors) {
        if (recipe.ingredients.length === 0) {
          $(selector).each((i, el) => {
            const text = $(el).text().trim();
            if (text) recipe.ingredients.push(text);
          });
        }
      }

      // Instructions
      recipe.instructions = [];
      const instructionSelectors = [
        '.mm-recipes-steps__content p',
        '.mntl-sc-block-html',
        '.instructions li',
        '.direction',
        '[data-instruction]'
      ];
      
      for (const selector of instructionSelectors) {
        if (recipe.instructions.length === 0) {
          $(selector).each((i, el) => {
            const text = $(el).text().trim();
            if (text && text.length > 10) recipe.instructions.push(text);
          });
        }
      }

      recipe.nutrition = {};
      recipe.details = {};
      recipe.imagePath = null;
    }

    return recipe;
  } catch (error) {
    console.error('Error scraping the recipe:', error.message);
    return null;
  }
}

module.exports = { scrapeAllRecipes };
