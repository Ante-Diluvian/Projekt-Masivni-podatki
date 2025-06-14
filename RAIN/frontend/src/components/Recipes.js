import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../userContext';
import { Link } from 'react-router-dom';

function Recipes() {
    const [recipes, setRecipes] = useState([]);

    useEffect(function(){
        const getRecipes = async function(){
            const res = await fetch("http://194.163.176.154:3001/recipes");
            const data = await res.json();
            setRecipes(data);
        }
        getRecipes();
    }, []);

  return (
    <section className="mt-5 recipes-container">
      <div className="recipes-header">
        <h2 className="recipes-title">EXPLORE OUR</h2>
        <h1 className="recipes-subtitle">RECIPES</h1>
      </div>

      <div className="recipes-grid">
        {recipes.map((recipe) => (
          <div key={recipe._id} className="recipe-card">
            <h3 className="recipe-name">{recipe.name}</h3>
              <div className="recipe-image-container">
              <img
                src={`http://194.163.176.154:3001/${recipe.imagePath}`}
                alt={recipe.name}
                className="recipe-image"
              />
              </div>

            {recipe.nutrition && (
              <div className="recipe-nutrition">
                <p>Calories: <span>{recipe.nutrition.calories} kcal</span></p>
                <p>Fat: <span>{recipe.nutrition.fat}</span></p>
                <p>Carbs: <span>{recipe.nutrition.carbs}</span></p>
                <p>Protein: <span>{recipe.nutrition.protein}</span></p>
              </div>
            )}

            <Link to={`/recipes/${recipe._id}`} className="recipe-button-text recipe-link">
              View Recipe
            </Link>        
          </div>
        ))}
      </div>
    </section>
  );
}

export default Recipes;