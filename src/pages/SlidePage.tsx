import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// import { useSlides } from '@/hooks/useSlides'; // Using alias - caused issue
import { useSlides } from '../hooks/useSlides'; // Using relative path

export default function SlidePage() {
  const { slideNumber: slideNumberParam } = useParams<{ slideNumber: string }>();
  const navigate = useNavigate();
  const slides = useSlides();

  const slideNumber = parseInt(slideNumberParam || '1', 10);
  const isValidSlideNumber = !isNaN(slideNumber) && slideNumber >= 1 && slideNumber <= slides.length;

  useEffect(() => {
    // Redirect to the first slide if the number is invalid or out of bounds
    if (!isValidSlideNumber && slides.length > 0) {
      console.warn(`Invalid slide number: ${slideNumberParam}. Redirecting to slide 1.`);
      navigate('/slide/1', { replace: true });
    }
  }, [slideNumberParam, isValidSlideNumber, navigate, slides.length]);

  // Handle the case where slides haven't loaded yet or the number is invalid
  if (!isValidSlideNumber || slides.length === 0) {
    // Optionally show a loading or not found state before redirect effect runs
    // Or return null if the redirect handles it quickly enough
    return null; 
  }

  // Adjust for 0-based index
  const currentSlideContent = slides[slideNumber - 1];

  // Use a container div for potential slide styling later
  return (
    <div className="slide-container">
      {/* Temporary display of raw markdown */}
      {/* We'll add proper markdown rendering later */}
      {/* <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
        {currentSlideContent}
      </pre> */}
      {/* Render markdown content */}
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {currentSlideContent}
      </ReactMarkdown>
    </div>
  );
} 