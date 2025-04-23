import { useEffect } from 'react'
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { useSlides } from './hooks/useSlides'
import Carousel from './components/Carousel'
import SlidePage from './pages/SlidePage'
import './App.css'

// Component to handle fetching slide number and rendering Carousel
const SlidesViewer = () => {
  const { slideNumber: slideNumberParam } = useParams<{ slideNumber: string }>();
  const navigate = useNavigate();
  const slides = useSlides(); // Fetch slides here

  const slideNumber = parseInt(slideNumberParam || '1', 10);
  const activeIndex = slideNumber - 1; // Calculate 0-based index for Carousel

  // Validation and redirection logic moved here from SlidePage
  useEffect(() => {
    const isValidSlideNumber = !isNaN(slideNumber) && slideNumber >= 1 && slideNumber <= slides.length;
    if (!isValidSlideNumber && slides.length > 0) {
      console.warn(`Invalid slide number: ${slideNumberParam}. Redirecting to slide 1.`);
      navigate('/slide/1', { replace: true });
    }
  }, [slideNumberParam, slideNumber, slides.length, navigate]);

  // Ensure we have slides and a valid index before rendering
  if (slides.length === 0 || activeIndex < 0 || activeIndex >= slides.length) {
    return null; // Or a loading/error state
  }

  return (
    <Carousel activeIndex={activeIndex}>
      {slides.map((content, index) => (
        <SlidePage key={index} content={content} />
      ))}
    </Carousel>
  );
};

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
      } else if (event.key === 'f') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen()
        } else if (document.exitFullscreen) {
          document.exitFullscreen()
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
    <div className="App w-screen h-screen">
      <Routes>
        {/* Redirect root path to the first slide */}
        <Route path="/" element={<Navigate to="/slide/1" replace />} />

        {/* Route for individual slides - Component added later */}
        <Route path="/slide/:slideNumber" element={<SlidesViewer />} />

        {/* Optional: Add a 404 handler later */}
        {/* <Route path="*" element={<div>Not Found</div>} /> */}
      </Routes>
    </div>
  )
}

export default App
