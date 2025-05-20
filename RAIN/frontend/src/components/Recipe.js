import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../userContext';
import { useParams } from "react-router-dom";
import { Link } from 'react-router-dom';

function Recipe() {
    const userContext = useContext(UserContext);
    const { id } = useParams();  
    const [recipe, setRecipe] = useState([]);
    const [error, setError] = useState([]);

    useEffect(function(){
        const getRecipe = async function(){
            const res = await fetch("http://localhost:3001/recipes/"+id);
            const data = await res.json();
            setRecipe(data);
        }
        getRecipe();
    }, []);

    return (
        <div className="vh-200 pt-5 mt-5 container my-4">
          <div className="card p-4 shadow-sm">
            <h4 className="mt-3 text-center">{recipe.name}</h4>
            
            <div className="mt-3">
              <h5>Ingredients</h5>
              <ul>
                {Array.isArray(recipe.ingredients)
                    ? recipe.ingredients.map((item) => <li>{item}</li>)
                    : <li>{recipe.ingredients}</li>}
              </ul>
            </div>
    
            <div className="mt-3">
              <h5>Instructions</h5>
              {Array.isArray(recipe.instructions)
                ? recipe.instructions.map((step) => <p>{step}</p>)
                : <p>{recipe.instructions}</p>}
            </div>
            <Link to={`/recipes`} className="text-blue-500 hover:underline mt-3">back</Link>
          </div>
        </div>
      );
}

export default Recipe;
