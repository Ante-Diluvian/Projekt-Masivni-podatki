import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../userContext';
import { useParams, useNavigate } from "react-router-dom";

function Recipe() {
    const userContext = useContext(UserContext);
    const navigate = useNavigate();
    const { id } = useParams();  
    const [recipe, setRecipe] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        const getRecipe = async () => {
            try {
                const res = await fetch("http://localhost:3001/recipes/" + id);
                const data = await res.json();
                setRecipe(data);
            } catch (err) {
                setError("Failed to load recipe");
            }
        };
        getRecipe();
    }, [id]);

    return (
        <section className="mt-5 recipe-container">
            <div className="recipe-header">
                <h2 className="recipe-title">RECIPE</h2>
                <h1 className="recipe-subtitle">{recipe.name}</h1>
            </div>

            {recipe.imagePath && (
                <div className="recipe-image-within">
                    <img
                        src={`http://localhost:3001/${recipe.imagePath}`}
                        alt={recipe.name}
                        className="recipe-image"
                    />
                </div>
            )}

            <div className="recipe-card1">
                {error && <p className="recipe-error">{error}</p>}

                <div className="recipe-section">
                    <h3 className="recipe-section-title">Ingredients</h3>
                    <ul className="recipe-list">
                        {Array.isArray(recipe.ingredients) &&
                            recipe.ingredients.map((item, index) => {
                                if (typeof item === 'string') {
                                    return (
                                        <li key={index} className="recipe-list-item">
                                            {item}
                                        </li>
                                    );
                                } else if (typeof item === 'object' && item.items) {
                                    return (
                                        <li key={index} className="recipe-list-item">
                                            {item.heading && <strong>{item.heading}</strong>}
                                            <ul>
                                                {item.items.map((subItem, subIndex) => (
                                                    <li key={subIndex} className="recipe-list-item">
                                                        {subItem}
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                    );
                                }
                                return null;
                            })}
                    </ul>
                </div>

                <div className="recipe-section">
                    <h3 className="recipe-section-title">Instructions</h3>
                    <div className="recipe-instructions">
                        {Array.isArray(recipe.instructions)
                            ? recipe.instructions.map((step, index) => (
                                <p key={index} className="recipe-step">
                                    {index + 1}. {step}
                                </p>
                            ))
                            : <p className="recipe-step">{recipe.instructions}</p>}
                    </div>
                </div>

                <button
                    onClick={() => navigate(-1)}
                    className="recipe-button-text recipe-back-link"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        color: '#FF3B3F'
                    }}
                >
                    ← Go Back
                </button>
            </div>
        </section>
    );
}

export default Recipe;
