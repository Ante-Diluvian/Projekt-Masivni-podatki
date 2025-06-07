import { useEffect, useContext } from 'react';
import { UserContext } from '../userContext';
import { Navigate } from 'react-router-dom';

function Logout(){
    const userContext = useContext(UserContext); 
    useEffect(function(){
        const logout = async function(){
            userContext.setUserContext(null);
            const res = await fetch("http://194.163.176.154:3001/users/logout");
        }
        logout();
    }, []);

    
    return (
        <Navigate replace to="/" />
    );
}

export default Logout;