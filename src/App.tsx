import React, { useEffect } from 'react'; // Add useEffect here
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Cube3Page } from './pages/Cube3Page';
import { TimelineManualSolvePage } from './pages/TimelineManualSolvePage';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cube" element={<Cube3Page />} />
        <Route path="/scan" element={<TimelineManualSolvePage/>} />
      </Routes>
    </Router>
  );
}

export default App;