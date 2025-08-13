import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Cube2Page } from './pages/Cube2Page';
import { Cube3Page } from './pages/Cube3Page';
import { Cube4Page } from './pages/Cube4Page';
import { ManualSolvePage } from './pages/ManualSolvePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cube/2" element={<Cube2Page />} />
        <Route path="/cube/3" element={<Cube3Page />} />
        <Route path="/cube/4" element={<Cube4Page />} />
        <Route path="/scan" element={<ManualSolvePage />} />
      </Routes>
    </Router>
  );
}

export default App;