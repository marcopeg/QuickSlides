import { useEffect } from 'react'
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { useSlides } from './hooks/useSlides'
import './App.css'

// Placeholder for the component we will create
import SlidePage from './pages/SlidePage'

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const slides = useSlides()
  const totalSlides = slides.length

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Extract current slide number from path, e.g., "/slide/3"
      const match = location.pathname.match(/^\/slide\/(\d+)$/)
      if (!match) return // Not on a slide page

      const currentSlide = parseInt(match[1], 10)
      if (isNaN(currentSlide)) return // Should not happen if routes are correct

      let nextSlide: number | null = null

      if (event.key === 'ArrowRight') {
        if (currentSlide < totalSlides) {
          nextSlide = currentSlide + 1
        }
      } else if (event.key === 'ArrowLeft') {
        if (currentSlide > 1) {
          nextSlide = currentSlide - 1
        }
      }

      if (nextSlide !== null) {
        navigate(`/slide/${nextSlide}`)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
    // Depend on location, navigate, and totalSlides to re-bind if needed
  }, [location, navigate, totalSlides])

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
