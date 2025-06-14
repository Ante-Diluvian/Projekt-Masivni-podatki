import { useState} from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserContext } from "./userContext.js";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import Logout from "./components/Logout";
import Footer from './components/Footer.js';
import Recipes from './components/Recipes.js';  
import Recipe from './components/Recipe.js';
import Statistics from './components/Statistics.js'; 
import MainScreen from './components/MainScreen.js';
import Admin from './components/Admin.js';
import Profile from './components/Profile.js';
import NewExercise from './components/NewExercise.js'

function App() {
  const [user, setUser] = useState(localStorage.user ? JSON.parse(localStorage.user) : null);
  const updateUserData = (userInfo) => {
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);
  }

  return (
    <BrowserRouter>
    <UserContext.Provider value={{
      user: user,
      setUserContext: updateUserData
    }}>
      <div className="App d-flex flex-column min-vh-100">
        <Header/> 
        <div className="container">
        <Routes>
          <Route path="/" element={<MainScreen/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/logout" element={<Logout/>} />
          <Route path="/recipes" element={<Recipes/>} />
          <Route path="/recipes/:id" element={<Recipe/>} />
          <Route path="/statistics" element={<Statistics/>} />
          <Route path='/admin' element={<Admin/>} />
          <Route path='/profile' element={<Profile/>} />
          <Route path='/newexecise' element={<NewExercise/>} />
        </Routes>
        </div>
        <Footer/>
      </div>
    </UserContext.Provider>
  </BrowserRouter>
);
}

export default App;
