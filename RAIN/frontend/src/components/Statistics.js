import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../userContext';
import { WorkoutMetricsChart, SpeedChart, ElevationChart } from '../Chart';
import WorkoutMap from '../WorkoutMap';
function Workouts() {
  const { user } = useContext(UserContext);
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('metrics');

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
        setSelectedWorkout(data[0] || null);
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

  if (loading) return <div className="alert alert-info">Loading workouts...</div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

 return (
    <div className="container pt-5 mt-5">
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="list-group">
            {workouts.map((workout) => (
              <button
                key={workout._id.toString()}
                className="list-group-item list-group-item-action workout-button text-white mb-2"
                style={{
                  cursor: 'pointer',
                  backgroundColor: '#2C2C2E',
                  border: 'none',
                  borderLeft: selectedWorkout && selectedWorkout._id.toString() === workout._id.toString()
                    ? '4px solid #FF3B30'
                    : '4px solid transparent',
                  borderRadius: '0.5rem',
                  boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                }}
                onClick={() => setSelectedWorkout(workout)}
              >
                <h6 className="mb-1">{workout.name}</h6>
                <small className="text-muted">
                  Duration: {workout.duration} s<br />
                  Calories: {workout.caloriesBurned} kcal
                </small>
              </button>
            ))}
          </div>
        </div>

        <div className="col-md-9">
          {selectedWorkout ? (
            <div className="card text-white shadow-sm" style={{ borderRadius: '0.5rem' }}>
              <div className="card-body" style={{ backgroundColor: '#2C2C2E', boxShadow: '0 0 20px rgba(0,0,0,0.5)', borderRadius: '0.5rem'}}>

                <div className="row">
                  <div className="col-md-6">
                    <h5 className="card-title">{selectedWorkout.name}</h5>

                    <p className="workout-detail-text">
                      <span className="workout-detail-highlight">Duration:</span>{' '}
                      {selectedWorkout.duration} s
                    </p>

                    <p className="workout-detail-text">
                      <span className="workout-detail-highlight">Calories:</span>{' '}
                      {selectedWorkout.caloriesBurned} kcal
                    </p>

                    <p className="workout-detail-text">
                      <span className="workout-detail-highlight">Distance:</span>{' '}
                      {selectedWorkout.distance} m
                    </p>

                    <p className="workout-detail-text">
                      <span className="workout-detail-highlight">Start:</span>{' '}
                      {new Date(selectedWorkout.startTimestamp).toLocaleString()}
                    </p>

                    <p className="workout-detail-text">
                      <span className="workout-detail-highlight">End:</span>{' '}
                      {new Date(selectedWorkout.endTimestamp).toLocaleString()}
                    </p>

                    {selectedWorkout.accelerometer && (
                      <>
                        <p className="workout-detail-text">
                          <span className="workout-detail-highlight">Avg Speed:</span>{' '}
                          {selectedWorkout.accelerometer.avgSpeed} m/s
                        </p>
                        <p className="workout-detail-text">
                          <span className="workout-detail-highlight">Max Speed:</span>{' '}
                          {selectedWorkout.accelerometer.maxSpeed} m/s
                        </p>
                      </>
                    )}
                  </div>

                  <div className="col-md-6 d-flex align-items-start">
                    <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                      {selectedWorkout.gps?.latitude?.length >= 3 ? (
                        <WorkoutMap gps={selectedWorkout.gps} />
                      ) : (
                        <div
                          className="d-flex justify-content-center align-items-center h-100"
                          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                        >
                          <small className="text-muted">No valid GPS data.</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <ul className="nav nav-tabs mt-4 mb-3">
                  <li className="nav-item">
                    <button
                      className={`nav-link text-white ${activeTab === 'metrics' ? 'active' : ''}`}
                      onClick={() => setActiveTab('metrics')}
                      style={{ cursor: 'pointer' }}
                    >
                      Metrics
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link text-white ${activeTab === 'speed' ? 'active' : ''}`}
                      onClick={() => setActiveTab('speed')}
                      style={{ cursor: 'pointer' }}
                    >
                      Speed
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link text-white ${activeTab === 'elevation' ? 'active' : ''}`}
                      onClick={() => setActiveTab('elevation')}
                      style={{ cursor: 'pointer' }}
                    >
                      Elevation
                    </button>
                  </li>
                </ul>

                <div className="tab-content">
                  {activeTab === 'metrics' && (
                    <WorkoutMetricsChart workout={selectedWorkout} />
                  )}
                  {activeTab === 'speed' && (
                    <SpeedChart workout={selectedWorkout} />
                  )}
                  {activeTab === 'elevation' && (
                    <ElevationChart workout={selectedWorkout} />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted">Select a workout on the left to see details.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Workouts;