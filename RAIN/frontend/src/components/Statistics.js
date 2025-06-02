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
    <div className="container pt-5 mt-5">
      <h2 className="mb-4">Workout Statistics</h2>

      {workouts.length === 0 ? (
        <p className="text-muted">No workouts found.</p>
      ) : (
        <>
          <div className="row">
            {workouts.map((workout) => (
              <div className="col-md-6 mb-4" key={workout._id}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{workout.name}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">
                      User: {workout.user_id?.username || 'N/A'}
                    </h6>
                    <p className="card-text">
                      <strong>Duration:</strong> {workout.duration} s<br />
                      <strong>Calories:</strong> {workout.caloriesBurned} kcal<br />
                      <strong>Distance:</strong> {workout.distance} km<br />
                      {workout.accelerometer && (
                        <>
                          <strong>Avg Speed:</strong> {workout.accelerometer.avgSpeed} m/s<br />
                          <strong>Max Speed:</strong> {workout.accelerometer.maxSpeed} m/s<br />
                        </>
                      )}
                      <strong>Start:</strong> {new Date(workout.startTimestamp).toLocaleString()}<br />
                      <strong>End:</strong> {new Date(workout.endTimestamp).toLocaleString()}
                    </p>

                    {workout.gps?.latitude?.length >= 3 ? (
                      <div className="mt-3">
                        <WorkoutMap gps={workout.gps} />
                      </div>
                    ) : (
                      <p className="text-muted">GPS: No valid data</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <h4>Visual Charts</h4>
            <WorkoutChart workouts={workouts} name={user._id} />
            <LatestChart workouts={workouts} />
            <Exercise workouts={workouts} />
          </div>
        </>
      )}
    </div>
  );
}

export default Workouts;