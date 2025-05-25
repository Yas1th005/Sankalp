import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import GetStarted from "./pages/GetStartedPage";
import { StudentDashboard } from "./pages/StudentDashboard"; // Updated import path
import SettingsPage from "./components/SettingsPage";
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/getstarted" element={<GetStarted />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<App />} />
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>
);