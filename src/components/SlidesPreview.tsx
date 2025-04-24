import React, { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react"; // Import Plus icon
import Slide from "./Slide"; // Corrected import path

interface SlidesPreviewProps {
  content: string;
  activeSlideIndex: number;
  onPreviewClick: (index: number) => void;
  onAddSlide: (index: number) => void; // New prop for adding slides
  className?: string;
}

const slideSeparator = "\n---\n"; // Define the separator

// Helper component for the Add Slide button
const AddSlideButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={(e) => {
      e.stopPropagation(); // Prevent triggering onPreviewClick
      onClick();
    }}
    className="w-full flex justify-center items-center py-1 text-gray-400 hover:text-blue-500 hover:bg-gray-300 rounded transition-colors duration-150"
    title="Add new slide here"
  >
    <Plus size={16} />
  </button>
);

const SlidesPreview: React.FC<SlidesPreviewProps> = ({
  content,
  activeSlideIndex,
  onPreviewClick,
  onAddSlide, // Destructure the new prop
  className = "",
}) => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  const slides = content.split(slideSeparator);
  const previewScale = 0.2; // Adjust scale factor as needed

  // Calculate aspect ratio, handle division by zero
  const windowAspectRatio =
    windowSize.height > 0 ? windowSize.width / windowSize.height : 16 / 9; // Default aspect ratio

  // Effect for scrolling active slide into view
  useEffect(() => {
    const activeSlideElement = slideRefs.current[activeSlideIndex];
    if (activeSlideElement) {
      activeSlideElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeSlideIndex]);

  // Reset refs when content changes significantly (prevents memory leaks)
  useEffect(() => {
    slideRefs.current = {};
  }, [content]);

  return (
    <div
      ref={scrollContainerRef} // Ref for the scrollable container
      className={`overflow-y-auto h-full bg-gray-200 p-4 rounded ${className}`}
    >
      {content.trim() === "" ? (
        // If content is empty, show a single button to create the first slide
        <button
          onClick={() => onAddSlide(0)}
          className="w-full flex justify-center items-center py-2 px-4 text-gray-500 bg-gray-100 hover:bg-gray-300 hover:text-blue-600 rounded transition-colors duration-150 border border-dashed border-gray-400"
          title="Create the first slide"
        >
          <Plus size={18} className="mr-2" /> Create new slide
        </button>
      ) : (
        // Otherwise, show the list of previews and add buttons
        <div className="space-y-2">
          {" "}
          {/* Adjust spacing slightly */}
          {/* Button to add slide at the beginning */}
          <AddSlideButton onClick={() => onAddSlide(0)} />
          {slides.map((slideContent, index) => {
            // Conditionally apply highlight class
            const isActive = index === activeSlideIndex;
            const highlightClass = isActive
              ? "ring-2 ring-blue-500 ring-offset-2"
              : "";

            return (
              <React.Fragment key={index}>
                {" "}
                {/* Use Fragment to group */}
                <div
                  // Assign ref to the element
                  ref={(el) => {
                    slideRefs.current[index] = el;
                    return undefined;
                  }}
                  // Add onClick handler
                  onClick={() => onPreviewClick(index)}
                  className={`bg-white shadow-md rounded overflow-hidden relative transition-all duration-150 cursor-pointer ${highlightClass}`}
                  style={{
                    aspectRatio: windowAspectRatio,
                  }}
                >
                  {/* New inner wrapper for scaling */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: `${100 / previewScale}%`, // Make it 1/scale larger
                      height: `${100 / previewScale}%`, // Make it 1/scale larger
                      transform: `scale(${previewScale})`, // Scale it down
                      transformOrigin: "top left",
                    }}
                    className="overflow-hidden" // Clip content to scaled bounds
                  >
                    {/* Slide fills the oversized wrapper before scaling */}
                    <Slide content={slideContent} />
                  </div>
                </div>
                {/* Button to add slide after the current one */}
                <AddSlideButton onClick={() => onAddSlide(index + 1)} />
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SlidesPreview;
