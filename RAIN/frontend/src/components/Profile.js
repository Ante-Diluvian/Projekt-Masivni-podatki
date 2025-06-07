import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../userContext';
import { Navigate } from 'react-router-dom';

function Profile() {
  const userContext = useContext(UserContext);
  const [profile, setProfile] = useState({});

  useEffect(() => {
    const getProfile = async () => {
      const res = await fetch("http://194.163.176.154:3001/users/me", { credentials: "include" });
      const data = await res.json();
      setProfile(data);
    };
    getProfile();
  }, []);

  if (!userContext.user) return <Navigate to="/login" />;

  return (
    <section className="login-container">
      <div className="login-box" style={{ maxWidth: '500px' }}>
        <h2 className="login-title">WELCOME</h2>
        <h1 className="login-subtitle">{profile.username?.toUpperCase()}</h1>

        <div className="profile-details">
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Gender:</strong> {profile.gender}</p>
          <p><strong>Height:</strong> {profile.height} cm</p>
          <p><strong>Weight:</strong> {profile.weight} kg</p>
          <p><strong>Age:</strong> {profile.age}</p>
          <p><strong>Joined:</strong> {new Date(profile.timestamp).toLocaleDateString()}</p>
        </div>
      </div>
    </section>
  );
}

export default Profile;
