import React, { useState, useEffect, useRef } from 'react';
import './recipeCarousel.css';

export default function RecipeCarousel() {
  const mockRecipes = [
    { title: 'Chicken Salad Bowl', calories: 500 },
    { title: 'Grilled Salmon & Quinoa', calories: 650 },
    { title: 'Vegetarian Stir Fry', calories: 450 },
    { title: 'Beef Protein Wraps', calories: 700 },
    { title: 'Avocado Toast', calories: 400 },
    { title: 'Pasta Primavera', calories: 550 },
  ];

  // Funkcija: koliko kartic želimo videti hkrati
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

  // Posodobitev visibleCount ob resize
  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleCount());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Za “infinite loop” razširimo seznam receptov za `visibleCount` na koncu
  const extendedRecipes = [
    ...mockRecipes,
    ...mockRecipes.slice(0, visibleCount),
  ];
  const total = mockRecipes.length;

  // Koliko odstotkov znaša ENA karta glede na širino tracka
  const cardWidthPercent = 100 / extendedRecipes.length;

  // Premik na naslednjo karto
  const next = () => {
    setCurrentIndex((prev) => prev + 1);
    setIsAnimating(true);
  };

  // Premik na prejšnjo karto
  const prev = () => {
    if (currentIndex === 0) {
      // Če smo na prvi, prestavimo index na “duplicate tail” in po animaciji na zadnjo pravo karto
      setCurrentIndex(total);
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
        setCurrentIndex(total - 1);
      }, 500);
    } else {
      setCurrentIndex((prev) => prev - 1);
      setIsAnimating(true);
    }
  };

  // Reset timerja
  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  // Avtomatski napredek na 3s
  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(next, 3000);
    return () => resetTimeout();
  }, [currentIndex, visibleCount]);

  // Ko pridemo do “duplicate slice” (index == total), reset index na 0 brez animacije
  useEffect(() => {
    if (currentIndex === total) {
      setTimeout(() => {
        setIsAnimating(false);
        setCurrentIndex(0);
      }, 500);
    }
  }, [currentIndex]);

  return (
    <div className="carousel-container">
      {/* Gumb “Nazaj” */}
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

      {/* Gumb “Naprej” */}
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

      {/* TRACK */}
      <div
        className="carousel-track"
        style={{
          // Širina tracka = (#kartic * 100 / visibleCount)%
          width: `${(extendedRecipes.length * 100) / visibleCount}%`,
          // Pomik: vsakič premečemo za cardWidthPercent % tracka
          transform: `translateX(-${currentIndex * cardWidthPercent}%)`,
          transition: isAnimating ? 'transform 500ms ease' : 'none',
        }}
      >
        {extendedRecipes.map((recipe, idx) => {
          // Preverimo, ali je ta karta “center” (za senco/scale)
          const relIdx = idx - currentIndex;
          const isCenter = relIdx === 1;

          return (
            <div
              key={idx}
              className={`carousel-card${
                isCenter ? ' carousel-card--center' : ''
              }`}
              style={{
                // Vsaka karta = cardWidthPercent % širine tracka
                flex: `0 0 ${cardWidthPercent}%`,
                maxWidth: `${cardWidthPercent}%`,
              }}
            >
              <h5 style={{ margin: 0, marginBottom: '0.5rem' }}>
                {recipe.title}
              </h5>
              <p style={{ margin: 0 }}>{recipe.calories} kcal</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
