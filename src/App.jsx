import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import { CubePage } from './pages/CubePage';
import { TimelineManualSolvePage } from './pages/TimelineManualSolvePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cube" element={<CubePage />} />
        <Route path="/scan" element={<TimelineManualSolvePage/>} />
      </Routes>
    </Router>
  );
}

export default App;