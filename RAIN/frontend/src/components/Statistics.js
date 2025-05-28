import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../userContext';

function Recipes() {
  const { user } = useContext(UserContext);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const GetWorkouts = async function() {
      if (!user?._id) return;
      
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:3001/workouts/workouts/${user._id}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        const data = await res.json();
        setWorkouts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setWorkouts([]);
      } finally {
        setLoading(false);
      }
    }
    
    GetWorkouts();
  }, [user]);

  if (loading) return <p>Loading workouts...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="vh-200 pt-5 mt-5">
      <h2>Workout Data</h2>
      {workouts.length === 0 ? (
        <p>No workouts found.</p>
      ) : (
        <ul>
          {workouts.map((workout) => (
            <li key={workout._id}>
              <strong>{workout.name}</strong><br />
              Duration: {workout.duration} min<br />
              Calories: {workout.caloriesBurned} kcal<br />
              Distance: {workout.distance} km<br />
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Recipes;
