import { useContext } from 'react';
import { UserContext } from '../userContext';
import { Navigate } from 'react-router-dom';

function MainScreen() {
  const { user } = useContext(UserContext);


  return (
    <div className="text-center d-flex flex-column justify-content-center align-items-center h-100">
      dwa
    </div>
  );
}

export default MainScreen;
