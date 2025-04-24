import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Play } from "lucide-react";
import defaultSlidesContent from "@/slides.md?raw"; // Import raw markdown content
import { Button } from "@/components/ui/button";
import SlidesPreview from "@/components/SlidesPreview"; // Import the new component

const LOCAL_STORAGE_KEY = "quickslides-content";
const slideSeparator = "\n---\n"; // Make sure this matches SlidesPreview

const HomePage: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation(); // Get location object
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

        // --- Scroll textarea to center selection ---
        const textarea = textareaRef.current;
        const midPos = (startPos + endPos) / 2;
        const estimatedScrollTop =
          (midPos / content.length) * textarea.scrollHeight;
        let targetScrollTop = estimatedScrollTop - textarea.clientHeight / 2;

        // Clamp scroll position
        targetScrollTop = Math.max(0, targetScrollTop);
        targetScrollTop = Math.min(
          targetScrollTop,
          textarea.scrollHeight - textarea.clientHeight
        );

        textarea.scrollTop = targetScrollTop;
        // --- End scroll logic ---
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

  // Helper function to request fullscreen
  const requestFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
        );
      });
    } // Add checks for vendor prefixes if needed for older browsers
    // else if (element.mozRequestFullScreen) { /* Firefox */ element.mozRequestFullScreen(); }
    // else if (element.webkitRequestFullscreen) { /* Chrome, Safari & Opera */ element.webkitRequestFullscreen(); }
    // else if (element.msRequestFullscreen) { /* IE/Edge */ element.msRequestFullscreen(); }
  };

  // Effect to focus and select the appropriate slide on load/navigation
  useEffect(() => {
    // Only run if content has been loaded and is not just whitespace
    if (content && content.trim().length > 0) {
      // Check location state for the last slide number from presentation mode
      const lastSlide = location.state?.lastSlide as number | undefined;
      let initialIndex = 0;
      if (lastSlide && typeof lastSlide === "number" && lastSlide > 0) {
        // Adjust for 0-based index and ensure it's within bounds
        const numSlides = content.split(slideSeparator).length;
        initialIndex = Math.min(numSlides - 1, lastSlide - 1);
      }

      // Call handlePreviewClick for the determined initial slide
      handlePreviewClick(initialIndex);
    }
    // NOTE: This effect now also depends on location state.
  }, [content, handlePreviewClick, location.state]); // Depend on content, handler, and location state

  // useEffect for global keydown listener
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const isModifier = event.metaKey || event.ctrlKey;

      // Handle Cmd/Ctrl + Enter variants
      if (event.key === "Enter" && isModifier) {
        event.preventDefault();
        localStorage.setItem(LOCAL_STORAGE_KEY, content); // Save content before navigating

        if (event.shiftKey) {
          // Shift + Cmd/Ctrl + Enter: Fullscreen from slide 1
          requestFullscreen();
          navigate("/slide/1");
        } else {
          // Cmd/Ctrl + Enter: Present from active slide
          const startSlide = activeSlideIndex + 1;
          navigate(`/slide/${startSlide}`);
        }
      }
      // Handle Escape globally
      else if (event.key === "Escape") {
        event.preventDefault();
        handleReset();
      }
      // Handle Cmd/Ctrl + Arrow Up/Down
      else if (
        (event.key === "ArrowUp" || event.key === "ArrowDown") &&
        isModifier
      ) {
        event.preventDefault();
        const slides = content.split(slideSeparator);
        const numSlides = slides.length;
        let newIndex = activeSlideIndex;

        if (event.key === "ArrowUp") {
          newIndex = Math.max(0, activeSlideIndex - 1);
        } else if (event.key === "ArrowDown") {
          newIndex = Math.min(numSlides - 1, activeSlideIndex + 1);
        }

        if (newIndex !== activeSlideIndex) {
          handlePreviewClick(newIndex);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
    // Ensure requestFullscreen is stable or memoized if defined inside component
    // Since it has no dependencies, defining it outside or using useCallback([]) works.
    // Here, we just include it as it's defined in the component scope.
  }, [
    content,
    activeSlideIndex,
    handlePresent,
    handleReset,
    handlePreviewClick,
    requestFullscreen,
    navigate,
  ]); // Updated dependencies

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
