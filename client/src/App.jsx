import {Routes, Route, Link} from 'react-router-dom';
import SignIn from "./components/SignIn.jsx";
import Home from "./components/Home.jsx";
import SignOut from './components/SignOut.js';
import AuthContext from './components/AuthContext.jsx'; 
import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie'; 
import 'tailwindcss/tailwind.css';
import SignUp from './components/SignUp.js';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(['loggedIn']); 

  const handleLogin = () => {
    setLoggedIn(true);
    setCookie('loggedIn', true, { path: '/' }); 
  };

  const handleLogout = () => {
    setLoggedIn(false);
    removeCookie('loggedIn', { path: '/' }); 
  }
  useEffect(() => {
    const storedLoggedIn = cookies.loggedIn;
    if (storedLoggedIn) {
      setLoggedIn(true);
    }
  }, [cookies]);
    return(
        <AuthContext.Provider value={{loggedIn, setLoggedIn, handleLogin, handleLogout}}>
        {loggedIn? <Link to="/logout">Logout</Link> :<Link to="/login">Login</Link>}
    <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/logout" element={<SignOut />}/>
        <Route path="/login" element={<SignIn />}/>
        <Route path="/signup" element={<SignUp/>}/>
    </Routes>
    </AuthContext.Provider>)
}
export default App;