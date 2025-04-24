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
  const initialFocusDoneRef = useRef<boolean>(false); // Flag for initial focus

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
    let currentPosition = 0;
    const slides = content.split(slideSeparator);
    // Default to the last slide index, handles edge cases
    let calculatedIndex = Math.max(0, slides.length - 1);

    for (let i = 0; i < slides.length; i++) {
      const slideContent = slides[i] ?? ""; // Handle potentially undefined slides
      const endOfSlideContent = currentPosition + slideContent.length;

      // Check if cursor is within or exactly at the end of this slide's content
      if (
        cursorPosition >= currentPosition &&
        cursorPosition <= endOfSlideContent
      ) {
        calculatedIndex = i;
        break; // Found the slide
      }

      // Check if cursor is within the separator area *after* this slide
      if (i < slides.length - 1) {
        const startOfSeparator = endOfSlideContent;
        const endOfSeparator = startOfSeparator + slideSeparator.length;
        if (
          cursorPosition > startOfSeparator &&
          cursorPosition <= endOfSeparator
        ) {
          // Cursor is in the separator, associate with the *next* slide
          calculatedIndex = i + 1;
          break; // Found the slide
        }
        // Move position marker past the separator for the next iteration
        currentPosition = endOfSeparator;
      } else {
        // Last slide, just move position marker past the content
        currentPosition = endOfSlideContent;
      }
    }

    // Only update if the index actually changed
    setActiveSlideIndex((prevIndex) => {
      if (prevIndex !== calculatedIndex) {
        return calculatedIndex;
      }
      return prevIndex;
    });
  }, [content, cursorPosition]);

  // Function to handle clicks on slide previews
  const handlePreviewClick = useCallback(
    (clickedIndex: number) => {
      // Read current content directly from textarea ref
      const currentContent = textareaRef.current?.value ?? "";
      if (!textareaRef.current || currentContent === null) return; // Guard if ref not ready or value is null

      const slides = currentContent.split(slideSeparator);
      let startPos = 0;
      let endPos = 0;

      // Calculate start and end position of the clicked slide's content
      for (let i = 0; i < slides.length; i++) {
        const slideLength = slides[i] ? slides[i].length : 0;
        const separatorLength =
          i < slides.length - 1 ? slideSeparator.length : 0;

        if (i < clickedIndex) {
          startPos += slideLength + separatorLength;
        } else if (i === clickedIndex) {
          endPos = startPos + slideLength;
          break;
        }
      }

      const slideContent = slides[clickedIndex];
      if (slideContent) {
        const leadingNewlineRegex = /^\n\s*/;
        const match = slideContent.match(leadingNewlineRegex);
        if (match && match[0]) {
          const lengthToSkip = match[0].length;
          if (startPos + lengthToSkip <= endPos) {
            startPos += lengthToSkip;
          }
        }
      }

      startPos = Math.max(0, startPos);
      endPos = Math.min(currentContent.length, endPos);

      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(startPos, endPos);
      setCursorPosition(startPos);

      const textarea = textareaRef.current;
      const midPos = (startPos + endPos) / 2;
      const estimatedScrollTop =
        (midPos / currentContent.length) * textarea.scrollHeight;
      let targetScrollTop = estimatedScrollTop - textarea.clientHeight / 2;

      targetScrollTop = Math.max(0, targetScrollTop);
      targetScrollTop = Math.min(
        targetScrollTop,
        textarea.scrollHeight - textarea.clientHeight
      );

      textarea.scrollTop = targetScrollTop;
    },
    [] // Remove content dependency, handlePreviewClick is now stable
  );

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

  // Effect to handle initial focus/selection or focus after navigation back
  useEffect(() => {
    // Only run if content is loaded
    if (content && content.trim().length > 0) {
      // Check if initial focus/selection has already been done for this mount/navigation
      if (!initialFocusDoneRef.current) {
        const lastSlide = location.state?.lastSlide as number | undefined;
        let initialIndex = 0;
        if (lastSlide && typeof lastSlide === "number" && lastSlide > 0) {
          const numSlides = content.split(slideSeparator).length;
          initialIndex = Math.min(numSlides - 1, lastSlide - 1);
        }
        handlePreviewClick(initialIndex); // Perform the focus/selection
        initialFocusDoneRef.current = true; // Mark as done
      }
    }
  }, [content, location.state, handlePreviewClick]); // Runs when content loads or location state changes

  // Effect to reset the initial focus flag when navigating back with state
  useEffect(() => {
    // If location.state exists (likely from navigating back), allow initial focus logic to run again
    if (location.state?.lastSlide) {
      initialFocusDoneRef.current = false;
    }
    // We might also want to reset it if the component fully unmounts and remounts,
    // but for SPA navigation, resetting based on location.state is key.
    // Resetting content should NOT reset this flag.
  }, [location.state]);

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
