import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../userContext';
import { Navigate } from 'react-router-dom';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userContext = useContext(UserContext);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchExercises();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/users', {
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/exercises', {
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setExercises(data);
      } else {
        setError(data.message || 'Failed to fetch exercises');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="container-fluid py-4 mt-5 admin-container">
      <h1 className="text-center mb-4 text-white">Admin Dashboard</h1>
      
      <ul className="nav nav-tabs justify-content-center mb-4 border-0">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'exercises' ? 'active' : ''}`}
            onClick={() => setActiveTab('exercises')}
          >
            Exercises
          </button>
        </li>
      </ul>

      {error && (
        <div className="alert alert-danger text-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5 text-white-50">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading data...</p>
        </div>
      ) : activeTab === 'users' ? (
        <UsersTable users={users}  />
      ) : (
        <ExercisesTable exercises={exercises}  />
      )}
    </div>
  );
}

function UsersTable({ users }) {
  return (
    <div className="table-responsive">
      <table className="table table-dark table-hover">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Username</th>
            <th scope="col">Email</th>
            <th scope="col">Admin</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td className="text-truncate" style={{maxWidth: '150px'}}>{user._id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                {user.isAdmin ? (
                  <span className="badge bg-danger">Admin</span>
                ) : (
                  <span className="badge bg-secondary">User</span>
                )}
              </td>
              <td>
                <button className="btn btn-sm btn-outline-danger"> Delete </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExercisesTable({ exercises}) {
  return (
    <div className="table-responsive">
      <table className="table table-dark table-hover">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {exercises.map(exercise => (
            <tr key={exercise._id}>
              <td className="text-truncate" style={{maxWidth: '150px'}}>{exercise._id}</td>
              <td>{exercise.name}</td>
             
              <td>
                <button className="btn btn-sm btn-outline-danger">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-sm btn-outline-danger"> Add Exercise</button>
    </div>
  );
}

export default AdminPanel;