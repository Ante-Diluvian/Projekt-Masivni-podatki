import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './recipeCarousel.css';

export default function RecipeCarousel() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch('http://localhost:3001/recipes');
        const data = await res.json();
        setRecipes(data);
      } catch (err) {
        console.error("Napaka pri pridobivanju receptov:", err);
      }
    };
    fetchRecipes();
  }, []);

  const getVisibleCount = () => {
    const w = window.innerWidth;
    if (w < 768) return 1;
    if (w < 1024) return 2;
    return 3;
  };

  const [visibleCount, setVisibleCount] = useState(getVisibleCount());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const extendedRecipes = [...recipes, ...recipes.slice(0, visibleCount)];
  const total = recipes.length;
  const cardWidthPercent = 100 / extendedRecipes.length;

  const next = () => {
    setCurrentIndex((prev) => prev + 1);
    setIsAnimating(true);
  };

const prev = () => {
  if (currentIndex === 0) {
    setIsAnimating(true);
    setCurrentIndex(-1);
  } else {
    setIsAnimating(true);
    setCurrentIndex((prev) => prev - 1);
  }
};

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(next, 3000);
    return () => resetTimeout();
  }, [currentIndex, visibleCount]);

  useEffect(() => {
    if (currentIndex === total) {
      const timeout = setTimeout(() => {
        setIsAnimating(false);
        setCurrentIndex(0);
      }, 500);
    }

    if (currentIndex === -1) {
      const timeout = setTimeout(() => {
        setIsAnimating(false);
        setCurrentIndex(total - 1);
      }, 500);
      return () => clearTimeout(timeout);
    }
    setIsAnimating(true);
  }, [currentIndex, total]);

  if (!recipes.length) return null;

  return (
    <div className="carousel-container">
      <button
        className="carousel-button carousel-button--left"
        onClick={() => {
          prev();
          resetTimeout();
        }}
        aria-label="Previous recipe"
      >
        ‹
      </button>

      <button
        className="carousel-button carousel-button--right"
        onClick={() => {
          next();
          resetTimeout();
        }}
        aria-label="Next recipe"
      >
        ›
      </button>

      <div
        className="carousel-track"
        style={{
          width: `${(extendedRecipes.length * 100) / visibleCount}%`,
          transform: `translateX(-${currentIndex * cardWidthPercent}%)`,
          transition: isAnimating ? 'transform 500ms ease' : 'none',
        }}
      >
        {extendedRecipes.map((recipe, idx) => {
          const isCenter = visibleCount > 2 && (idx === currentIndex + 1);

            return (
                <Link
                    to={`/recipes/${recipe._id}`}
                    key={idx}
                    className={`carousel-card${isCenter ? ' carousel-card--center' : ''}`}
                    style={{
                        flex: `0 0 ${cardWidthPercent}%`,
                        maxWidth: `${cardWidthPercent}%`,
                        textDecoration: 'none',
                    }}
                    >
                    <div className="carousel-card-content">
                        <h3 className="recipe-name">{recipe.name}</h3>
                        {recipe.nutrition ? (
                        <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                            <p>Calories: <span>{recipe.nutrition.calories} kcal</span></p>
                            <p>Fat: <span>{recipe.nutrition.fat} g</span></p>
                            <p>Carbs: <span>{recipe.nutrition.carbs} g</span></p>
                            <p>Protein: <span>{recipe.nutrition.protein} g</span></p>
                        </div>
                        ) : (
                        <p>No nutrition info</p>
                        )}
                    </div>
                </Link>
            );
        })}
      </div>
    </div>
  );
}