import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { UserContext } from '../userContext';
import { WorkoutMetricsChart, SpeedChart, ElevationChart } from '../Chart';
import WorkoutMap from '../WorkoutMap';

function Workouts() {
  const [selectedType, setSelectedType] = useState('All');
  const [availableTypes, setAvailableTypes] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('metrics');

  const rightColRef = useRef(null);
  const dropdownRef = useRef(null);
  const [maxListHeight, setMaxListHeight] = useState(0);

  const { user } = useContext(UserContext);

  // Novi state, ki spremlja, ali je zaslon premajhen (<768px)
  const [isSmallScreen, setIsSmallScreen] = useState(
    window.innerWidth < 768
  );

  // Poslušaj window resize, da sproti posodobiš isSmallScreen
  useEffect(() => {
    const onResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const fetchExerciseNames = async () => {
      try {
        const res = await fetch('http://194.163.176.154:3001/exercises/names');
        const data = await res.json();
        setAvailableTypes([...new Set(data.map(name => name.split(' ')[0]))]);
      } catch (err) {
        console.error('Error fetching exercise names:', err);
      }
    };
    fetchExerciseNames();
  }, []);

  useEffect(() => {
    const GetWorkouts = async () => {
      if (!user?._id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://194.163.176.154:3001/workouts/workouts/${user._id}`);
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

  useLayoutEffect(() => {
    if (rightColRef.current && dropdownRef.current) {
      const rightH = rightColRef.current.clientHeight;
      const ddH = dropdownRef.current.clientHeight;
      const computedMax = rightH - ddH - 16; // 16px rezerve
      setMaxListHeight(computedMax > 0 ? computedMax : 0);
    }
  }, [selectedWorkout, activeTab, workouts]);

  if (loading) return <div className="alert alert-info">Loading workouts...</div>;
  if (error)   return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div
      className="container pt-5 mt-5"
      style={{
        height: 'calc(100vh - 7rem)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="row"
        style={{
          flex: 1,
          display: 'flex',
          // Če je zaslon premajhen, dovolimo navpični scroll cele vrstice;
          // sicer skrijemo prelivanje (scroll bo znotraj stolpcev).
          overflow: isSmallScreen ? 'auto' : 'hidden',
        }}
      >
        {/* ——— LEVI STOLPEC ——— */}
        <div
          className="col-12 col-md-3 mb-4"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '94.4%',
            overflow: 'hidden',
          }}
        >
          {/* ▶▶▶ DROPDOWN FILTER ◀◀◀ */}
          <div ref={dropdownRef} className="mb-2 mt-1" style={{ marginLeft: '0.3rem' }}>
            <label htmlFor="typeSelect" className="form-label text-white">Filter by Type</label>
            <select
              id="typeSelect"
              className="form-select"
              style={{
                backgroundColor: '#2C2C2E',
                color: '#FFFFFF',
                border: 'none',
                marginLeft: '0.5rem',
                borderRadius: '0.5rem',
                paddingLeft: '0.75rem',
                paddingRight: '2rem',
                height: 'calc(2.25rem + 2px)',
                appearance: 'none',
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23FFFFFF' viewBox='0 0 16 16'%3E%3Cpath d='M1.5 5.5l6 6 6-6' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E\")",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1rem',
              }}
              value={selectedType}
              onChange={(e) => {
                const type = e.target.value;
                setSelectedType(type);
                const filtered = workouts.filter((w) =>
                  type === 'All' ? true : w.name.includes(type)
                );
                setSelectedWorkout(filtered[0] || null);
              }}
            >
              <option value="All">All</option>
              {availableTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* ▶▶▶ SEZNAM TRENINGOV ◀◀◀ */}
          <div
            className="list-group workout-scroll"
            style={{
              flex: 1,
              overflowY: 'auto',
              backgroundColor: '#1C1C1E',
              scrollSnapType: 'y mandatory',
              maxHeight: isSmallScreen ? 'none' : maxListHeight,
            }}
          >
            {workouts
              .filter((w) =>
                selectedType === 'All' ? true : w.name.includes(selectedType)
              )
              .map((workout) => (
                <button
                  key={workout._id.toString()}
                  className={`list-group-item list-group-item-action workout-button text-white mb-2 ${
                    selectedWorkout &&
                    selectedWorkout._id.toString() === workout._id.toString()
                      ? 'active'
                      : ''
                  }`}
                  style={{
                    backgroundColor: '#2C2C2E',
                    border: 'none',
                    borderLeft:
                      selectedWorkout &&
                      selectedWorkout._id.toString() === workout._id.toString()
                        ? '4px solid #FF3B30'
                        : '4px solid transparent',
                    borderRadius: '0.5rem',
                    scrollSnapAlign: 'start',
                    transform: 'scale(0.98)',
                    transformOrigin: 'top center',
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

        {/* ——— DESNI STOLPEC ——— */}
        <div
          className="col-12 col-md-9"
          ref={rightColRef}
          style={{
            height: '100%',
            overflowY: 'auto',
            paddingLeft: '1rem',
          }}
        >
          {selectedWorkout ? (
            <div className="card text-white shadow-sm" style={{ borderRadius: '0.5rem' }}>
              <div
                className="card-body"
                style={{
                  backgroundColor: '#2C2C2E',
                  boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                  borderRadius: '0.5rem',
                }}
              >
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
                  {activeTab === 'metrics' && <WorkoutMetricsChart workout={selectedWorkout} />}
                  {activeTab === 'speed' && <SpeedChart workout={selectedWorkout} />}
                  {activeTab === 'elevation' && <ElevationChart workout={selectedWorkout} />}
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
