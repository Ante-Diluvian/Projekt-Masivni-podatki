import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../userContext';
import {WorkoutChart, LatestChart, Exercise } from '../Chart';
import WorkoutMap from '../WorkoutMap';

function Workouts() {
  const { user } = useContext(UserContext);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const GetWorkouts = async () => {
      if (!user?._id) return;

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:3001/workouts/workouts/${user._id}`);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();
        setWorkouts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setWorkouts([]);
      } finally {
        setLoading(false);
      }
    };

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
        <>
          <ul>
            {workouts.map((workout) => (
              <li key={workout._id}>
                <strong>{workout.name}</strong><br />
                User: {workout.user_id?.username || 'N/A'} <br />
                Duration: {workout.duration} s<br />
                Calories: {workout.caloriesBurned} kcal<br />
                Distance: {workout.distance} km<br />
                
                {workout.accelerometer && (
                  <>
                    Avg Speed: {workout.accelerometer.avgSpeed} m/s<br />
                    Max Speed: {workout.accelerometer.maxSpeed} m/s<br />
                  </>
                )}
                
              {workout.gps && workout.gps.latitude?.length > 0 ? (
                <>
                  <ul>
                    {workout.gps.latitude.map((lat, index) => (
                      <li key={index}>
                        Point {index + 1}:<br />
                        Latitude: {lat}, Longitude: {workout.gps.longitude?.[index] ?? 'N/A'}, Altitude: {workout.gps.altitude?.[index] ?? 'N/A'}
                      </li>
                    ))}
                  </ul>

                  {workout.gps.latitude.length >= 3 && (//Izberi pri kolkih št. točkah nariši zemljevid potem pa se spremini  v WorkoutMap.js
                    <WorkoutMap gps={workout.gps} />
                  )}
                </>
              ) : (
                <p>GPS Points: 0 point recorded</p>
              )}


                
                Start Time: {new Date(workout.startTimestamp).toLocaleString()}<br />
                End Time: {new Date(workout.endTimestamp).toLocaleString()}<br />
                <hr />
              </li>
            ))}
          </ul>
          
          <WorkoutChart workouts={workouts} name="6830f9833d0ba745596c3bf0" />
          <LatestChart workouts={workouts} />
          <Exercise workouts={workouts} />
        </>
      )}
    </div>
  );

}

export default Workouts;
