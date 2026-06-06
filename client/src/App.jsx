import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Layout from './components/Layout'; // Your Layout file
import Dashboard from './pages/Dashboard';
import CheckIn from './pages/CheckIn';
import Tools from './pages/Tools';
import Coach from './pages/Coach';
import Layout from './components/layout/Layout';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="checkin" element={<CheckIn />} />
          <Route path="tools" element={<Tools />} />
          <Route path="coach" element={<Coach />} />
          {/* For presentation, you can point Analytics and Profile back to Dashboard or create blanks */}
          <Route path="analytics" element={<Navigate to="/dashboard" />} />
          <Route path="profile" element={<Navigate to="/dashboard" />} />
        </Route>
      </Routes>
    </Router>
  );
}