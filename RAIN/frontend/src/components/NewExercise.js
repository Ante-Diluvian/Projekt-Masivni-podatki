import { useState, useContext } from 'react';
import { UserContext } from '../userContext';
import { Navigate } from 'react-router-dom';

function NewExercise() {
  const userContext = useContext(UserContext);
  const [name, setName] = useState('');
  const [metValue, setSetValue] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [category, setCategory] = useState('');
  const [uploaded, setUploaded] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!name) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('metValue', Number(metValue));
    formData.append('image', imagePath);
    formData.append('category', category);

    const res = await fetch('http://194.163.176.154:3001/exercises', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    const data = await res.json();
    if (data) {
      setUploaded(true);
    }
  }

  if (uploaded) return <Navigate replace to="/admin" />;

  if (!userContext.user) {
    return <div className="text-white text-center py-5">Loading...</div>;
  }

  if (userContext.user.user_type !== 1) {
    return <Navigate replace to="/" />;
  }


  return (
    <>
    <section className="login-container">
      <div className="login-box">
        <h2 className="login-title">ADD NEW</h2>
        <h1 className="login-subtitle">EXERCISE</h1>

        <form onSubmit={onSubmit} className="login-form">
          <input type="text" placeholder="Exercise Name" value={name} onChange={(e) => setName(e.target.value)} required className="login-input"/>

          <input type="number" min="1" max="500" placeholder="MET Value" value={metValue} onChange={(e) => setSetValue(e.target.value)} required className="login-input"/>

          <input type="file" onChange={(e) => setImagePath(e.target.files[0])} required className="login-input" />

          <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required className="login-input" />

          <button type="submit" className="login-button">Submit</button>
        </form>
      </div>
    </section>
    </>
  );
}

export default NewExercise;
