import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import CheThai from './pages/forms/CheThai';
import OnigiriTarts from './pages/forms/OnigiriTarts';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/che-thai" element={<CheThai />} />
        <Route path="/onigiri-tarts" element={<OnigiriTarts />} />
      </Routes>
    </Router>
  );
}
