import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import CheThai from './pages/forms/CheThai';
import OnigiriEggTarts from './pages/forms/OnigiriEggTarts';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/che-thai" element={<CheThai />} />
        <Route path="/onigiri-egg-tarts" element={<OnigiriEggTarts />} />
      </Routes>
    </Router>
  );
}
