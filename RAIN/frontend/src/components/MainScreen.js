import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../userContext';
import RecipeCarousel from '../RecipeCarousel';
import { WorkoutChart, LatestChart, Exercise } from '../Chart';
import { useNavigate } from 'react-router-dom';

function MainScreen() {
  const { user } = useContext(UserContext);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('last');
  const navigate = useNavigate(); 

  useEffect(() => {
    if (!user?._id)
      navigate('/login');

    const GetWorkouts = async () => {
      if (!user?._id) return;

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://194.163.176.154:3001/workouts/workouts/${user._id}`);
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

  const totalCaloriesWeek = workouts
    .filter(w => {
      const diff = Date.now() - new Date(w.startTimestamp).getTime();
      return diff <= 7 * 24 * 60 * 60 * 1000; //Last 7 days
    })
    .reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

  if (loading) return <div className="alert alert-info">Loading data...</div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div className="container pt-4 mt-5 mb-2.6">
      <div className="card text-white shadow-sm mb-4" style={{ backgroundColor: '#2C2C2E', borderRadius: '0.5rem' }}>
        <div className="card-body" style={{ boxShadow: '0 0 20px rgba(0,0,0,0.5)', borderRadius: '0.5rem' }}>
          <h5 className="card-title text-center login-title">Your Weekly Overview</h5>

          <ul className="nav nav-tabs mt-4 mb-3">
            <li className="nav-item">
              <button
                className={`nav-link text-white ${activeTab === 'last' ? 'active' : ''}`}
                onClick={() => setActiveTab('last')}
                style={{ cursor: 'pointer' }}
              >
                Last Workout
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link text-white ${activeTab === 'common' ? 'active' : ''}`}
                onClick={() => setActiveTab('common')}
                style={{ cursor: 'pointer' }}
              >
                Top Exercise
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link text-white ${activeTab === 'summary' ? 'active' : ''}`}
                onClick={() => setActiveTab('summary')}
                style={{ cursor: 'pointer' }}
              >
                Calorie Summary
              </button>
            </li>
          </ul>

          <div className="tab-content">
            {activeTab === 'last' && <LatestChart workouts={workouts} />}
            {activeTab === 'common' && <Exercise workouts={workouts} />}
            {activeTab === 'summary' && <WorkoutChart workouts={workouts} />}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="text-center mb-2 login-title">Suggested Recipes for This Week</h4>
        <RecipeCarousel calories={totalCaloriesWeek} />
      </div>
    </div>
  );
}

export default MainScreen;