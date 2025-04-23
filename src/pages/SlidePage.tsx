import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// No longer needs hooks or routing logic
// import { useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useSlides } from '../hooks/useSlides';

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

  // Render the passed markdown content
  return (
    <div className="slide-container w-full h-full flex items-center justify-center p-8">
      {/* Apply prose for markdown styling */}
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {String(content || '')} 
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default SlidePage; 