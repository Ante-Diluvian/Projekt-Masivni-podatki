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
            try {
                const res = await fetch("http://localhost:3001/recipes/"+id);
                const data = await res.json();
                setRecipe(data);
            } catch (err) {
                setError("Failed to load recipe");
            }
        }
        getRecipe();
    }, [id]);

    return (
        <section className="mt-5 recipe-container">
            <div className="recipe-header">
                <h2 className="recipe-title">RECIPE</h2>
                <h1 className="recipe-subtitle">{recipe.name}</h1>
            </div>

            <div className="recipe-card1">
                {error && <p className="recipe-error">{error}</p>}

                <div className="recipe-section">
                    <h3 className="recipe-section-title">Ingredients</h3>
                    <ul className="recipe-list">
                        {Array.isArray(recipe.ingredients)
                            ? recipe.ingredients.map((item, index) => 
                                <li key={index} className="recipe-list-item">{item}</li>)
                            : <li className="recipe-list-item">{recipe.ingredients}</li>}
                    </ul>
                </div>

                <div className="recipe-section">
                    <h3 className="recipe-section-title">Instructions</h3>
                    <div className="recipe-instructions">
                        {Array.isArray(recipe.instructions)
                            ? recipe.instructions.map((step, index) => 
                                <p key={index} className="recipe-step">{index + 1}. {step}</p>)
                            : <p className="recipe-step">{recipe.instructions}</p>}
                    </div>
                </div>

                <Link to="/recipes" className="recipe-button-text recipe-back-link">
                     Back to Recipes
                </Link>
            </div>
        </section>
    );
}

export default Recipe;