import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../userContext';
import { Navigate, Link } from 'react-router-dom';

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
      const res = await fetch('http://194.163.176.154:3001/users', {
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
      const res = await fetch('http://194.163.176.154:3001/exercises', {
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
  
  const deleteExercises = async (id) =>{
    try {
      setLoading(true);
      const res = await fetch(`http://194.163.176.154:3001/exercises/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Failed to delete exercise');
      } else {
        setExercises(prev => prev.filter(ex => ex._id !== id));
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }

  const deleteUser = async (id) =>{
    try {
      setLoading(true);
      const res = await fetch(`http://194.163.176.154:3001/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Failed to delete exercise');
      } else {
        setUsers(prev => prev.filter(ex => ex._id !== id));
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (!userContext.user) {
    return <div className="text-white text-center py-5">Loading...</div>;
  }

  if (userContext.user.user_type !== 1) {
    return <Navigate replace to="/" />;
  }
  console.log("UserContext:", userContext.user);

  return (
    <>   

      <div className="container-fluid py-4 mt-5 admin-container">
        <h1 className="text-center mb-4 text-white">Admin Dashboard</h1>
        
        <ul className="nav nav-tabs justify-content-center mb-4 border-0">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
              Users
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'exercises' ? 'active' : ''}`} onClick={() => setActiveTab('exercises')}>
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
              <span className="visually-hidden" />
            </div>
          </div>

        ) : activeTab === 'users' ? (
          <UsersTable users={users} onDelete={deleteUser} />
        ) : (
          <ExercisesTable exercises={exercises} onDelete={deleteExercises} />
        )}
      </div>
    </>
  );
}

function UsersTable({ users, onDelete }) {
  return (
    <div className="table-responsive">
      <div className="admin-table-wrapper" style={{ maxHeight: '480px', overflowY: 'auto' }}>
      <table className="table table-dark table-hover">
        <thead >
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
                {user.user_type === 1 ? (
                  <span className="badge bg-danger">Admin</span>
                ) : (
                  <span className="badge bg-secondary">User</span>
                )}
              </td>
              <td>
                <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(user._id)}> Delete </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}

function ExercisesTable({ exercises, onDelete }) {
  return (
    <div className="table-responsive">
      <div className="admin-table-wrapper" style={{ maxHeight: '480px', overflowY: 'auto' }}>
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
                  <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(exercise._id)} >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link to="/newexecise" className="btn btn-sm btn-outline-danger"> Add Exercise</Link>
    </div>
  );
}


export default AdminPanel;