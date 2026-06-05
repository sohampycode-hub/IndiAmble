import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LocationDetail from './pages/LocationDetail';
import AiAgent from './pages/AiAgent';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import User from './pages/User';

function ProtectedWrapper({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/signup" replace />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Since App is now wrapped by BrowserRouter in main.jsx, Navbar can safely use useNavigate()! */}
      <Navbar />
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/" element={
          <ProtectedWrapper>
            <Home />
          </ProtectedWrapper>
        } />
        <Route path="/region/:id" element={
          <ProtectedWrapper>
            <LocationDetail />
          </ProtectedWrapper>
        } />
        <Route path="/ai-agent" element={
          <ProtectedWrapper>
            <AiAgent />
          </ProtectedWrapper>
        } />

        <Route path="/profile" element={
          <ProtectedWrapper>
           <User />
         </ProtectedWrapper>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}