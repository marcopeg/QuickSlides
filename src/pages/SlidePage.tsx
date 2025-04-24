// No longer needs hooks or routing logic
// import { useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useSlides } from '../hooks/useSlides';

// Import the new Slide component
import Slide from "@/components/Slide";

interface SlidePageProps {
  content: string; // Expect markdown content as a prop
}

// export default function SlidePage() { // Old function signature
const SlidePage: React.FC<SlidePageProps> = ({ content }) => {
  // const { slideNumber: slideNumberParam } = useParams<{ slideNumber: string }>();
  // const navigate = useNavigate();
  // const slides = useSlides();
  //
  // const slideNumber = parseInt(slideNumberParam || '1', 10);
  // const isValidSlideNumber = !isNaN(slideNumber) && slideNumber >= 1 && slideNumber <= slides.length;
  //
  // useEffect(() => {
  //   // Redirect to the first slide if the number is invalid or out of bounds
  //   if (!isValidSlideNumber && slides.length > 0) {
  //     console.warn(`Invalid slide number: ${slideNumberParam}. Redirecting to slide 1.`);
  //     navigate('/slide/1', { replace: true });
  //   }
  // }, [slideNumberParam, isValidSlideNumber, navigate, slides.length]);
  //
  // // Handle the case where slides haven't loaded yet or the number is invalid
  // if (!isValidSlideNumber || slides.length === 0) {
  //   // Optionally show a loading or not found state before redirect effect runs
  //   // Or return null if the redirect handles it quickly enough
  //   return null;
  // }
  //
  // // Adjust for 0-based index
  // const currentSlideContent = slides[slideNumber - 1];

  // Render using the new Slide component
  return (
    // Container is simplified, layout handled by Slide component
    <div className="slide-page-container w-full h-full">
      <Slide content={content} />
    </div>
  );
};

export default SlidePage;
