import React, { useState, useEffect, useRef } from 'react';

function RecipeCarousel() {
  const mockRecipes = [
    { title: 'Chicken Salad Bowl', calories: 500 },
    { title: 'Grilled Salmon & Quinoa', calories: 650 },
    { title: 'Vegetarian Stir Fry', calories: 450 },
    { title: 'Beef Protein Wraps', calories: 700 },
    { title: 'Avocado Toast', calories: 400 },
    { title: 'Pasta Primavera', calories: 550 },
  ];

  const visibleCount = 3;
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef(null);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % mockRecipes.length);
  };

  const prev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? mockRecipes.length - 1 : prev - 1
    );
  };

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      next();
    }, 3000);

    return () => resetTimeout();
  }, [currentIndex]);

  const getVisibleRecipes = () => {
    let visible = [];
    for (let i = 0; i < visibleCount; i++) {
      visible.push(mockRecipes[(currentIndex + i) % mockRecipes.length]);
    }
    return visible;
  };

  const visibleRecipes = getVisibleRecipes();

  return (
    <div
      style={{
        position: 'relative',
        maxWidth: '900px',
        margin: 'auto',
        color: 'white',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        height: '180px',
      }}
    >
      {/* Gumb Nazaj */}
      <button
        onClick={() => {
          prev();
          resetTimeout();
        }}
        style={{
          backgroundColor: 'rgba(255, 59, 48, 0.8)',
          border: 'none',
          borderRadius: '0.5rem',
          width: '30px',     // fiksna širina gumba
          height: '100%',    // višina kot carousel
          color: 'white',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '48px',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          marginRight: '15px',
        }}
        aria-label="Previous recipe"
      >
        ‹
      </button>

      {/* Prikaz receptov */}
      <div
        style={{
          display: 'flex',
          gap: '15px',
          flexGrow: 1,
          height: '100%',
        }}
      >
        {visibleRecipes.map((recipe, idx) => (
          <div
            key={idx}
            className="card bg-dark text-white"
            style={{
              borderRadius: '0.5rem',
              padding: '1rem',
              flex: '1 0 calc(33.333% - 10px)',
              minWidth: 0,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'center',
              boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            }}
          >
            <h5 className="card-title">{recipe.title}</h5>
            <p className="card-text">{recipe.calories} kcal</p>
          </div>
        ))}
      </div>

      {/* Gumb Naprej */}
      <button
        onClick={() => {
          next();
          resetTimeout();
        }}
        style={{
          backgroundColor: 'rgba(255, 59, 48, 0.8)',
          border: 'none',
          borderRadius: '0.5rem',
          width: '30px',      // fiksna širina gumba
          height: '100%',     // višina kot carousel
          color: 'white',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '48px',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          marginLeft: '15px',
        }}
        aria-label="Next recipe"
      >
        ›
      </button>
    </div>
  );
}

export default RecipeCarousel;
