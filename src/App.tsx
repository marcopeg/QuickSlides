import { useEffect } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useSlides } from "@/hooks/useSlides";
import Carousel from "@/components/Carousel";
import SlidePage from "@/pages/SlidePage";
import HomePage from "@/pages/HomePage";

// Component to handle fetching slide number and rendering Carousel
const SlidesViewer = () => {
  const { slideNumber: slideNumberParam } = useParams<{
    slideNumber: string;
  }>();
  const navigate = useNavigate();
  const slides = useSlides(); // Fetch slides here
  const totalSlides = slides.length;

  const slideNumber = parseInt(slideNumberParam || "1", 10);
  const activeIndex = slideNumber - 1; // Calculate 0-based index for Carousel

  // --- Swipe Handlers ---
  const handleSwipeLeft = () => {
    // Go to the next slide, but don't loop (stay on last)
    const nextSlideNumber = Math.min(slideNumber + 1, totalSlides);
    if (nextSlideNumber !== slideNumber) {
      navigate(`/slide/${nextSlideNumber}`);
    }
  };

  const handleSwipeRight = () => {
    // Go to the previous slide, but don't loop (stay on first)
    const prevSlideNumber = Math.max(slideNumber - 1, 1);
    if (prevSlideNumber !== slideNumber) {
      navigate(`/slide/${prevSlideNumber}`);
    }
  };

  const handleSwipeVertical = () => {
    // Exit to homepage
    console.log("Vertical swipe detected, exiting to homepage...");
    navigate("/", { state: { lastSlide: slideNumber } });
  };
  // --- End Swipe Handlers ---

  // Validation and redirection logic moved here from SlidePage
  useEffect(() => {
    const isValidSlideNumber =
      !isNaN(slideNumber) && slideNumber >= 1 && slideNumber <= slides.length;
    if (!isValidSlideNumber && slides.length > 0) {
      console.warn(
        `Invalid slide number: ${slideNumberParam}. Redirecting to slide 1.`
      );
      navigate("/slide/1", { replace: true });
    }
  }, [slideNumberParam, slideNumber, slides.length, navigate]);

  // Effect to update document title based on active slide
  useEffect(() => {
    let title = "QuickSlides Presentation";
    const imageOnlyRegex = /^\s*!\[(.*?)\]\(.+\)\s*$/;
    const firstImageRegex = /^\s*!\[(.*?)\]\(.+\)/;

    if (slides && slides.length > activeIndex && slides[activeIndex]) {
      const activeSlideContent = slides[activeIndex];
      const imageOnlyMatch = activeSlideContent.match(imageOnlyRegex);
      const firstImageMatch = activeSlideContent.match(firstImageRegex);

      let potentialTitle = "";

      if (imageOnlyMatch && imageOnlyMatch[1]) {
        // Case 1: Slide contains ONLY an image
        potentialTitle = imageOnlyMatch[1].trim();
      } else if (firstImageMatch && firstImageMatch[1]) {
        // Case 2: Slide STARTS with an image
        potentialTitle = firstImageMatch[1].trim();
      } else {
        // Case 3: No image at start, use first text line
        const lines = activeSlideContent.split("\n");
        const firstLine =
          lines.find((line) => line.trim().length > 0)?.trim() || "";
        if (firstLine) {
          potentialTitle = firstLine.replace(/^#+\s*/, "").trim();
        }
      }

      // Truncate and set title if potentialTitle is found
      if (potentialTitle) {
        if (potentialTitle.length > 100) {
          potentialTitle = potentialTitle.substring(0, 97) + "...";
        }
        title = `Slide ${slideNumber} - ${potentialTitle}`;
      }
    }

    document.title = title;

    // Cleanup: Reset title when SlidesViewer unmounts
    return () => {
      document.title = "QuickSlides"; // Or your base app title
    };
  }, [slides, activeIndex, slideNumber]); // Depend on slides, active index, and slide number

  // Ensure we have slides and a valid index before rendering
  if (slides.length === 0 || activeIndex < 0 || activeIndex >= slides.length) {
    return null; // Or a loading/error state
  }

  return (
    <Carousel
      activeIndex={activeIndex}
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      onSwipeVertical={handleSwipeVertical}
    >
      {slides.map((content, index) => (
        <SlidePage key={index} content={content} />
      ))}
    </Carousel>
  );
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const slides = useSlides();
  const totalSlides = slides.length;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Extract current slide number from path, e.g., "/slide/3"
      const match = location.pathname.match(/^\/slide\/(\d+)$/);
      if (!match) return; // Not on a slide page

      const currentSlide = parseInt(match[1], 10);
      if (isNaN(currentSlide)) return; // Should not happen if routes are correct

      let nextSlide: number | null = null;

      if (event.key === "ArrowRight") {
        if (currentSlide < totalSlides) {
          nextSlide = currentSlide + 1;
        }
      } else if (event.key === "ArrowLeft") {
        if (currentSlide > 1) {
          nextSlide = currentSlide - 1;
        }
      } else if (event.key === "f") {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      } else if (event.key === "Escape") {
        // Navigate to homepage if Escape is pressed on a slide page
        // Pass the current slide number back via location state
        navigate("/", { state: { lastSlide: currentSlide } });
        return; // Stop further processing in this handler
      }
      // Handle Space and Shift+Space for navigation
      else if (event.key === " ") {
        event.preventDefault(); // Prevent page scroll
        if (event.shiftKey) {
          // Shift + Space: Go to previous slide
          if (currentSlide > 1) {
            nextSlide = currentSlide - 1;
          }
        } else {
          // Space: Go to next slide
          if (currentSlide < totalSlides) {
            nextSlide = currentSlide + 1;
          }
        }
      }
      // Handle Cmd/Ctrl + Enter in presentation mode (same as Escape)
      else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault(); // Prevent potential default actions
        navigate("/", { state: { lastSlide: currentSlide } });
        return;
      }

      // Only navigate if nextSlide was set (for Arrow keys)
      if (nextSlide !== null) {
        navigate(`/slide/${nextSlide}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    // Depend on location, navigate, and totalSlides to re-bind if needed
  }, [location, navigate, totalSlides]);

  return (
    // Add a wrapper div with h-screen to ensure full viewport height
    <div className="app-container h-screen">
      <Routes>
        {/* Route for the new homepage */}
        <Route path="/" element={<HomePage />} />

        {/* Route for individual slides */}
        <Route path="/slide/:slideNumber" element={<SlidesViewer />} />

        {/* Optional: Add a 404 handler later */}
        {/* <Route path="*" element={<div>Not Found</div>} /> */}
      </Routes>
    </div>
  );
}

export default App;
