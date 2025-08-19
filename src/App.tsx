import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Cube3Page } from './pages/Cube3Page';
import { ManualSolvePage } from './pages/ManualSolvePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cube/3" element={<Cube3Page />} />
        <Route path="/scan" element={<ManualSolvePage />} />
      </Routes>
    </Router>
  );
}

export default App;