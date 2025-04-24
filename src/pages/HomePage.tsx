import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import defaultSlidesContent from "@/slides.md?raw"; // Import raw markdown content
import { Button } from "@/components/ui/button";
import SlidesPreview from "@/components/SlidesPreview"; // Import the new component

const LOCAL_STORAGE_KEY = "quickslides-content";
const slideSeparator = "\n---\n"; // Make sure this matches SlidesPreview

const HomePage: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const navigate = useNavigate();
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref for the textarea

  useEffect(() => {
    // Load content from local storage or use default slides
    const storedContent = localStorage.getItem(LOCAL_STORAGE_KEY);
    setContent(storedContent ?? defaultSlidesContent);
  }, []);

  const handleContentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newContent = event.target.value;
    setContent(newContent);
    localStorage.setItem(LOCAL_STORAGE_KEY, newContent);
  };

  // Update cursor position state
  const handleCursorChange = useCallback(
    (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
      setCursorPosition(event.currentTarget.selectionStart);
    },
    []
  );

  // Calculate active slide index based on cursor position
  useEffect(() => {
    let charCount = 0;
    const slides = content.split(slideSeparator);
    let currentSlideIndex = 0;
    for (let i = 0; i < slides.length; i++) {
      charCount += slides[i].length;
      if (cursorPosition <= charCount) {
        currentSlideIndex = i;
        break;
      }
      // Add separator length if not the last slide
      if (i < slides.length - 1) {
        charCount += slideSeparator.length;
      }
    }
    setActiveSlideIndex(currentSlideIndex);
  }, [content, cursorPosition]);

  // Function to handle clicks on slide previews
  const handlePreviewClick = useCallback(
    (clickedIndex: number) => {
      const slides = content.split(slideSeparator);
      let startPos = 0;
      let endPos = 0;

      // Calculate start and end position of the clicked slide's content
      for (let i = 0; i < slides.length; i++) {
        const slideLength = slides[i] ? slides[i].length : 0;
        const separatorLength =
          i < slides.length - 1 ? slideSeparator.length : 0;

        if (i < clickedIndex) {
          // Before the clicked slide, just add lengths
          startPos += slideLength + separatorLength;
        } else if (i === clickedIndex) {
          // This is the clicked slide
          endPos = startPos + slideLength;
          break; // Found the range, no need to continue
        }
        // Note: We should not reach here if clickedIndex is valid (0 to slides.length - 1)
      }

      // Adjust startPos to skip leading newline with optional whitespace
      const slideContent = slides[clickedIndex];
      if (slideContent) {
        const leadingNewlineRegex = /^\n\s*/;
        const match = slideContent.match(leadingNewlineRegex);
        if (match && match[0]) {
          const lengthToSkip = match[0].length;
          // Ensure we don't skip past the end position
          if (startPos + lengthToSkip <= endPos) {
            startPos += lengthToSkip;
          }
        }
      }

      // Clamp positions just in case
      startPos = Math.max(0, startPos);
      endPos = Math.min(content.length, endPos);

      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(startPos, endPos);
        // Update cursor position state to the start of the selection for consistency
        setCursorPosition(startPos);
      }
    },
    [content]
  ); // Dependency: content

  // Use useCallback to memoize handlePresent for the effect dependency array
  const handlePresent = useCallback(() => {
    // Ensure latest content is saved before navigating
    localStorage.setItem(LOCAL_STORAGE_KEY, content);
    navigate("/slide/1");
  }, [content, navigate]); // Include dependencies

  // Extracted core reset logic, memoized with useCallback
  const resetContent = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setContent(defaultSlidesContent);
  }, []); // No dependencies needed here

  // Wrap handleReset in useCallback
  const handleReset = useCallback(() => {
    if (
      window.confirm(
        "Are you sure you want to reset the content to the default slides? Any changes will be lost."
      )
    ) {
      resetContent(); // Call the extracted reset logic
    }
  }, [resetContent]); // Dependency: resetContent

  // useEffect for global keydown listener
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Handle Cmd/Ctrl + Enter globally
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault(); // Prevent default behavior (e.g., form submission if inside one)
        handlePresent(); // Trigger presentation start
      }
      // Handle Escape globally
      else if (event.key === "Escape") {
        event.preventDefault(); // Prevent potential default browser actions for Escape
        handleReset(); // Call handleReset to include confirmation
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [handlePresent, handleReset]); // Add memoized functions as dependencies

  return (
    <div className="h-screen w-full bg-gray-100 p-4 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-center mb-6">QuickSlides</h1>
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden h-[85vh]">
        <div className="p-6 flex flex-col h-full">
          <div className="flex flex-row flex-grow gap-4 mb-4 overflow-hidden">
            <textarea
              ref={textareaRef} // Attach the ref
              value={content}
              onChange={handleContentChange}
              // Track cursor changes
              onClick={handleCursorChange}
              onKeyUp={handleCursorChange} // For arrow keys, backspace, delete etc.
              // onSelect={handleCursorChange} // Can be too frequent, use onClick/onKeyUp
              placeholder="Enter your slides here, separated by '---'"
              className="w-2/3 h-full p-4 border border-gray-300 rounded-md bg-gray-50 resize-none font-mono text-sm"
            />
            <SlidesPreview
              content={content}
              activeSlideIndex={activeSlideIndex}
              onPreviewClick={handlePreviewClick} // Pass the handler down
              className="w-1/3 h-full"
            />
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={handleReset} className="flex items-center">
              reset
            </Button>
            <Button
              onClick={handlePresent}
              className="flex items-center bg-orange-500 hover:bg-orange-600 text-white"
            >
              Present <Play className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
