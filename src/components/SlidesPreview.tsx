import React, { useState, useEffect, useRef } from "react";
import Slide from "./Slide"; // Corrected import path

interface SlidesPreviewProps {
  content: string;
  activeSlideIndex: number;
  className?: string;
}

const slideSeparator = "\n---\n"; // Define the separator

const SlidesPreview: React.FC<SlidesPreviewProps> = ({
  content,
  activeSlideIndex,
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
      <div className="space-y-4">
        {slides.map((slideContent, index) => {
          // Conditionally apply highlight class
          const isActive = index === activeSlideIndex;
          const highlightClass = isActive
            ? "ring-2 ring-blue-500 ring-offset-2"
            : "";

          return (
            <div
              key={index}
              // Assign ref to the element
              ref={(el) => (slideRefs.current[index] = el)}
              // Aspect ratio container - unscaled, defines the space.
              className={`bg-white shadow-md rounded overflow-hidden relative transition-all duration-150 ${highlightClass}`}
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
          );
        })}
      </div>
    </div>
  );
};

export default SlidesPreview;
