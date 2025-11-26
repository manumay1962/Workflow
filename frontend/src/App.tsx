import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Home from './components/Home';
import Login from './components/Login';

// FIX: API Base URL is now relative/empty for Render Redirects
const API_BASE_URL = ''; 

const AppContainer = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [username, setUsername] = useState("");
  const [token, setToken] = useState(""); 
  const navigate = useNavigate();

  useEffect(() => {
    const savedLogin = localStorage.getItem("isLoggedIn");
    const savedEmail = localStorage.getItem("userEmail");
    const savedName = localStorage.getItem("username");
    const savedToken = localStorage.getItem("token"); 
    
    if (savedLogin === "true" && savedEmail && savedToken) { 
        setIsLoggedIn(true); 
        setUserEmail(savedEmail);
        setUsername(savedName || "User");
        setToken(savedToken); 
        
        if (window.location.pathname === '/login' || window.location.pathname === '/') {
            navigate('/home');
        }
    } else {
        if (window.location.pathname !== '/login') {
             navigate('/login');
        }
    }
  }, [navigate]);

  const handleLogin = (email: string, uName: string, jwtToken: string) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);
    localStorage.setItem("username", uName);
    localStorage.setItem("token", jwtToken);
    
    setIsLoggedIn(true);
    setUserEmail(email);
    setUsername(uName);
    setToken(jwtToken);
    
    navigate('/home'); 
  };

  const handleLogout = async () => {
    await signOut(auth); 
    localStorage.clear(); 
    
    setIsLoggedIn(false);
    setUserEmail("");
    setUsername("");
    setToken("");
    
    navigate('/login'); 
  };

  return (
    <Routes>
        <Route 
            path="/login" 
            element={!isLoggedIn ? <Login onLoginSuccess={handleLogin} API_BASE_URL={API_BASE_URL} /> : <Navigate to="/home" />} 
        />
        <Route 
            path="/home" 
            element={isLoggedIn ? <Home userEmail={userEmail} username={username} token={token} onLogout={handleLogout} API_BASE_URL={API_BASE_URL} /> : <Navigate to="/login" />} 
        />
        <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
        <AppContainer />
    </Router>
  );
}