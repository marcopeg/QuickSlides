import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Placeholder for the component we will create
import SlidePage from './pages/SlidePage'

function App() {
  return (
    // Main container styling can be added later
    <div className="App">
      <Routes>
        {/* Redirect root path to the first slide */}
        <Route path="/" element={<Navigate to="/slide/1" replace />} />

        {/* Route for individual slides - Component added later */}
        <Route path="/slide/:slideNumber" element={<SlidePage />} />

        {/* Optional: Add a 404 handler later */}
        {/* <Route path="*" element={<div>Not Found</div>} /> */}
      </Routes>
    </div>
  )
}

export default App
