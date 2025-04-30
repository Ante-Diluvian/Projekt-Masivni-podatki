import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../userContext';
import { Link } from 'react-router-dom';

function Recipes() {
    const userContext = useContext(UserContext); 
    const [recipes, setRecipes] = useState([]);

    useEffect(function(){
        const getRecipes = async function(){
            const res = await fetch("http://localhost:3001/recipes");
            const data = await res.json();
            setRecipes(data);
        }
        getRecipes();
    }, []);

  return (
    <div className="vh-200 pt-5 mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto p-4">
    {recipes.map((recipe) => (
      <div key={recipe._id} className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-shadow" >
        <h2 className="text-2xl font-bold mb-2">{recipe.name}</h2>

        {recipe.nutrition && (
          <div className="text-sm text-gray-600 mb-2">
            <p>Calories: {recipe.nutrition.calories}</p>
            <p>Fat: {recipe.nutrition.fat}</p>
            <p>Carbs: {recipe.nutrition.carbs}</p>
            <p>Protein: {recipe.nutrition.protein}</p>
          </div>
        )}

        <Link to={`/recipes/${recipe._id}`} className="text-blue-500 hover:underline">
          View Recipe
        </Link>        
      </div>
    ))}
  </div>
  );
}

export default Recipes;
