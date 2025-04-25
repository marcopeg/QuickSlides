import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Play, Download, Upload, Plus, PanelLeft, Share2 } from "lucide-react";
import defaultSlidesContent from "@/slides.md?raw"; // Import raw markdown content
import { Button } from "@/components/ui/button";
import SlidesPreview from "@/components/SlidesPreview"; // Import the new component
import { useSlides } from "@/hooks/useSlides"; // Import useSlides
import LZString from "lz-string"; // Import lz-string
import * as QRCodeReact from "qrcode.react"; // Import namespace
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Import Dialog components

const LOCAL_STORAGE_KEY = "quickslides-content";
const slideSeparator = "\n---\n"; // Make sure this matches SlidesPreview

const HomePage: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false); // State for drag overlay
  const navigate = useNavigate();
  const location = useLocation(); // Get location object
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref for the textarea
  const initialFocusDoneRef = useRef<boolean>(false); // Flag for initial focus
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input
  const slides = useSlides(); // Use the hook to get processed slides
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false); // State for dialog
  const [shareUrl, setShareUrl] = useState<string>(""); // State for QR code URL

  // Effect to load shared content from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sharedData = params.get("q");

    if (sharedData) {
      // Remove query param from URL immediately to prevent reprocessing
      navigate(".", { replace: true });

      try {
        const decompressedContent = LZString.decompressFromBase64(sharedData);

        if (decompressedContent !== null && decompressedContent !== undefined) {
          // Check against current content (before potential update)
          const currentContent =
            localStorage.getItem(LOCAL_STORAGE_KEY) ?? defaultSlidesContent;

          if (decompressedContent !== currentContent) {
            if (
              window.confirm(
                "A shared presentation was found in the URL. Do you want to load it? This will replace your current content."
              )
            ) {
              // Use processImportedContent to update state and localStorage
              processImportedContent(decompressedContent);
              // Optionally, focus the first slide after import
              // handlePreviewClick(0); // Already handled by processImportedContent
            }
          } else {
            // Content is the same, no need to ask or update
            console.log("Shared content matches current content.");
          }
        } else {
          console.error("Failed to decompress shared content.");
          window.alert(
            "Error: Could not load the shared presentation data from the URL."
          );
        }
      } catch (error) {
        console.error("Error processing shared content URL:", error);
        window.alert(
          "Error: Could not process the shared presentation data from the URL."
        );
      }
    }
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures it runs only once

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

  // Update cursor position state AND active slide index
  const handleCursorChange = useCallback(
    (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
      const currentCursorPos = event.currentTarget.selectionStart;

      // Debug the current position
      // console.log("DEBUG: Cursor changed to position:", currentCursorPos);

      // Only calculate activeSlideIndex if cursorPosition is explicitly changed by user
      // Avoid auto-calculation if position is set programmatically during initialFocus or addSlide
      if (initialFocusDoneRef.current) {
        let calculatedIndex = 0;
        let currentPosition = 0;
        const slides = content.split(slideSeparator);
        calculatedIndex = Math.max(0, slides.length - 1);

        for (let i = 0; i < slides.length; i++) {
          const slideContent = slides[i] ?? "";
          const endOfSlideContent = currentPosition + slideContent.length;

          if (
            currentCursorPos >= currentPosition &&
            currentCursorPos <= endOfSlideContent
          ) {
            calculatedIndex = i;
            break;
          }

          if (i < slides.length - 1) {
            const startOfSeparator = endOfSlideContent;
            const endOfSeparator = startOfSeparator + slideSeparator.length;
            if (
              currentCursorPos > startOfSeparator &&
              currentCursorPos <= endOfSeparator
            ) {
              calculatedIndex = i + 1;
              break;
            }
            currentPosition = endOfSeparator;
          } else {
            currentPosition = endOfSlideContent;
          }
        }

        // console.log("DEBUG: Setting active slide index to:", calculatedIndex, "from cursor position:", currentCursorPos);
        setActiveSlideIndex(calculatedIndex);
      }
    },
    [content] // Depends only on content now
  );

  // Function to handle clicks on slide previews
  const handlePreviewClick = useCallback(
    (clickedIndex: number) => {
      // Read current content directly from textarea ref
      const currentContent = textareaRef.current?.value ?? "";
      if (!textareaRef.current || currentContent === null) return; // Guard if ref not ready or value is null

      // Force-set the active slide index immediately
      setActiveSlideIndex(clickedIndex);

      // Calculate and focus the slide's text region
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

      // Adjust endPos to potentially omit trailing newline
      if (endPos > startPos && currentContent[endPos - 1] === "\n") {
        endPos--;
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

  // Function to handle download
  const handleDownload = useCallback(() => {
    const defaultName = "QuickSlides";
    // Use prompt to get filename, confirm doesn't allow text input
    const filenameInput = window.prompt(
      "Enter filename for download:",
      defaultName
    );

    // Proceed only if user entered a name and didn't cancel
    if (filenameInput !== null && filenameInput.trim() !== "") {
      const filename = filenameInput.trim();
      const blob = new Blob([content], {
        type: "text/markdown;charset=utf-8;",
      });

      // Create a temporary link element
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.md`);
      link.style.visibility = "hidden";

      // Append to the document, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  }, [content]); // Depends on the current content

  // Function to handle import - triggers the hidden file input
  const handleImport = useCallback(() => {
    fileInputRef.current?.click(); // Trigger click on the hidden input
  }, []); // No dependencies needed here

  // Handles Share button click: generates URL and opens dialog
  const handleShare = useCallback(() => {
    if (content) {
      // Compress and encode the content
      const compressedContent = LZString.compressToBase64(content);
      // Construct the URL
      const url = `${window.location.origin}?q=${compressedContent}`;
      setShareUrl(url);
      setIsShareDialogOpen(true);
    } else {
      window.alert("Nothing to share yet!");
    }
  }, [content]);

  // Shared function to process imported content
  const processImportedContent = useCallback(
    (newContent: string) => {
      setContent(newContent);
      localStorage.setItem(LOCAL_STORAGE_KEY, newContent);
      // Optionally, reset cursor or focus after import
      if (textareaRef.current) {
        textareaRef.current.focus();
        handlePreviewClick(0); // Focus first slide preview
      }
    },
    [handlePreviewClick]
  ); // Added handlePreviewClick dependency

  // Handles the file selection from the hidden input
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return; // No file selected
      }

      // Basic check for markdown file types (optional, as 'accept' handles it)
      if (
        file.type !== "text/markdown" &&
        !file.name.endsWith(".md") &&
        !file.name.endsWith(".markdown")
      ) {
        window.alert(
          "Error: Please select a Markdown file (.md or .markdown)."
        );
        // Reset input value to allow re-selection
        if (event.target) event.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const fileContent = loadEvent.target?.result;
        if (typeof fileContent === "string") {
          processImportedContent(fileContent);
        } else {
          window.alert("Error: Could not read file content.");
        }
        // Reset input value to allow re-selection
        if (event.target) event.target.value = "";
      };
      reader.onerror = () => {
        window.alert(`Error: Failed to read file "${file.name}".`);
        // Reset input value to allow re-selection
        if (event.target) event.target.value = "";
      };
      reader.readAsText(file);
    },
    [processImportedContent] // Depends on the processing function
  );

  // Use useCallback to memoize handlePresent for the effect dependency array
  const handlePresent = useCallback(() => {
    // Ensure latest content is saved before navigating
    localStorage.setItem(LOCAL_STORAGE_KEY, content);
    navigate("/slide/1");
  }, [content, navigate]); // Include dependencies

  // Extracted core reset logic, memoized with useCallback
  const clearContent = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setContent(""); // Clear the content
    if (textareaRef.current) {
      textareaRef.current.focus(); // Focus textarea after clearing
    }
    setActiveSlideIndex(0); // Reset active slide index
  }, []); // No dependencies needed here

  // Wrap handleReset in useCallback
  const handleNewPresentation = useCallback(() => {
    if (
      window.confirm(
        "Are you sure you want to start a new presentation? The current content will be cleared."
      )
    ) {
      clearContent(); // Call the extracted clearing logic
    }
  }, [clearContent]); // Dependency: clearContent

  // Helper function to request fullscreen
  const requestFullscreen = useCallback(() => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
        );
      });
    }
  }, []);

  // Effect to handle initial focus/selection or focus after navigation back
  useEffect(() => {
    // Only run if content is loaded and textarea is available
    if (content && content.trim().length > 0 && textareaRef.current) {
      // Check if initial focus/selection has already been done
      if (!initialFocusDoneRef.current) {
        let initialIndex = 0;
        // Handle navigation back state if present
        const lastSlide = location.state?.lastSlide as number | undefined;
        if (lastSlide && typeof lastSlide === "number" && lastSlide > 0) {
          const numSlides = content.split(slideSeparator).length;
          initialIndex = Math.min(numSlides - 1, lastSlide - 1);
          console.log(
            "DEBUG: Setting from lastSlide navigation state, index:",
            initialIndex
          );
          // Recalculate focus for the target slide index
          handlePreviewClick(initialIndex); // Use existing logic for this case
        } else {
          // --- Direct Initial Focus Logic for index 0 ---
          const slides = content.split(slideSeparator);
          const startPos = 0;
          let endPos = 0;
          if (slides.length > 0) {
            const firstSlideLength = slides[0] ? slides[0].length : 0;
            endPos = firstSlideLength;
          }
          endPos = Math.min(content.length, Math.max(startPos, endPos));

          console.log(
            "DEBUG: Directly setting focus on index 0, startPos:",
            startPos,
            "endPos:",
            endPos
          );
          console.log(
            "DEBUG: First slide content:",
            slides[0]?.substring(0, 50)
          );

          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(startPos, endPos);
          setActiveSlideIndex(initialIndex); // Set to 0

          console.log(
            "DEBUG: Active slide index after direct setting:",
            initialIndex
          );
        }

        initialFocusDoneRef.current = true; // Mark as done

        // Let's verify again after a small delay what happened
        setTimeout(() => {
          console.log(
            "DEBUG: After a delay, active slide index is:",
            activeSlideIndex
          );
        }, 100);
      }
    }
  }, [content, location.state, handlePreviewClick, activeSlideIndex]); // Added activeSlideIndex dependency

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
    handlePreviewClick,
    requestFullscreen,
    navigate,
  ]); // Updated dependencies

  // Effect to update document title based on active slide
  useEffect(() => {
    let title = "QuickSlides Editor";
    const imageOnlyRegex = /^\s*!\[(.*?)\]\(.+\)\s*$/; // Check if ONLY an image
    const firstImageRegex = /^\s*!\[(.*?)\]\(.+\)/; // Check if starts with an image

    if (
      slides &&
      slides.length > activeSlideIndex &&
      slides[activeSlideIndex]
    ) {
      const activeSlideContent = slides[activeSlideIndex];
      const imageOnlyMatch = activeSlideContent.match(imageOnlyRegex);
      const firstImageMatch = activeSlideContent.match(firstImageRegex);

      let potentialTitle = "";

      if (imageOnlyMatch && imageOnlyMatch[1]) {
        // Case 1: Slide contains ONLY an image
        potentialTitle = imageOnlyMatch[1].trim();
      } else if (firstImageMatch && firstImageMatch[1]) {
        // Case 2: Slide STARTS with an image (but might have more content)
        potentialTitle = firstImageMatch[1].trim();
      } else {
        // Case 3: No image at the start, use first non-empty text line
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
        title = `QuickSlides - ${potentialTitle}`;
      }
    }

    document.title = title;

    // Cleanup: Reset title when HomePage unmounts
    return () => {
      document.title = "QuickSlides"; // Or your base app title
    };
  }, [slides, activeSlideIndex]); // Depend on slides array and active index

  // --- Drag and Drop Handlers ---

  const handleDragEnter = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      // Check if dragged items contain files
      if (
        event.dataTransfer.types &&
        event.dataTransfer.types.includes("Files")
      ) {
        setIsDraggingOver(true);
      }
    },
    []
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      // Ensure the drag state remains true while over the target
      if (
        !isDraggingOver &&
        event.dataTransfer.types &&
        event.dataTransfer.types.includes("Files")
      ) {
        setIsDraggingOver(true);
      }
    },
    [isDraggingOver]
  ); // Depend on isDraggingOver to avoid unnecessary calls

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      // Check if the leave event target is the main container itself or if it goes outside the window
      // This prevents flickering when dragging over child elements.
      const relatedTarget = event.relatedTarget as Node | null;
      if (!event.currentTarget.contains(relatedTarget)) {
        setIsDraggingOver(false);
      }
    },
    []
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDraggingOver(false);

      const files = event.dataTransfer.files;

      if (files && files.length === 1) {
        const file = files[0];
        // Basic check for markdown file types
        if (
          file.type === "text/markdown" ||
          file.name.endsWith(".md") ||
          file.name.endsWith(".markdown")
        ) {
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            const fileContent = loadEvent.target?.result;
            if (typeof fileContent === "string") {
              processImportedContent(fileContent);
            } else {
              window.alert("Error: Could not read file content.");
            }
          };
          reader.onerror = () => {
            window.alert(`Error: Failed to read file "${file.name}".`);
          };
          reader.readAsText(file);
        } else {
          window.alert(
            "Error: Please drop a single Markdown file (.md or .markdown)."
          );
        }
      } else if (files && files.length > 1) {
        window.alert("Error: Please drop only one file at a time.");
      } else {
        // Handle cases where something else was dropped (e.g., text)
        console.log("Dropped item was not a file or files list is empty.");
      }
    },
    [processImportedContent] // Depend on the processing function
  );

  // Function to handle adding a new slide
  const handleAddSlide = useCallback(
    (index: number) => {
      const newSlideContent = "# new slide";
      const slides = content.split(slideSeparator);

      console.log("DEBUG: Adding slide at index:", index);

      // Insert the new slide content at the specified index
      slides.splice(index, 0, newSlideContent);

      const newContent = slides.join(slideSeparator);

      // Update state and local storage
      setContent(newContent);
      localStorage.setItem(LOCAL_STORAGE_KEY, newContent);

      // Need to wait for the state update to reflect in the DOM
      requestAnimationFrame(() => {
        // Ensure textarea ref is available
        if (textareaRef.current) {
          console.log(
            "DEBUG: Before handlePreviewClick in handleAddSlide. Index:",
            index
          );
          handlePreviewClick(index); // Focus the newly added slide
          console.log(
            "DEBUG: After handlePreviewClick in handleAddSlide. Active index:",
            activeSlideIndex
          );

          // Setting explicitly as a failsafe
          setTimeout(() => {
            setActiveSlideIndex(index);
            console.log(
              "DEBUG: Explicitly set activeSlideIndex in failsafe:",
              index
            );
          }, 0);
        }
      });
    },
    [content, handlePreviewClick, activeSlideIndex] // Added activeSlideIndex
  );

  return (
    <div
      className="h-screen w-full bg-gray-100 flex flex-col items-center justify-start relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver} // Keep over state active
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop Zone Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-25 flex items-center justify-center z-50 pointer-events-none">
          <p className="text-white text-2xl font-bold">
            Drop Markdown file to import
          </p>
        </div>
      )}

      {/* Sticky Header Wrapper */}
      <div className="sticky top-0 z-10 bg-gray-100 w-full shadow-sm">
        {/* Original Title Bar Content - Centered */}
        <div className="w-full max-w-4xl flex items-center justify-between mx-auto px-4 py-2 md:py-4">
          {/* Group Title and Icon */}
          <div className="flex items-center">
            <PanelLeft className="h-5 w-5 mr-2" />
            <h1 className="text-xl md:text-3xl font-bold text-left">
              QuickSlides
            </h1>
          </div>
          {/* Present Button - Always visible in sticky header */}
          <Button
            onClick={handlePresent}
            className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white h-8 px-3 text-sm font-medium"
            title="Present (Cmd/Ctrl+Enter)"
          >
            Present <Play className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Area - Takes remaining space */}
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden flex-grow px-0 pb-2 mb-0 mt-0 lg:mt-4 lg:mb-4">
        <div className="p-2 sm:p-4 md:p-4 flex flex-col h-full">
          <div className="flex flex-row flex-grow gap-4 mb-4 sm:mb-4 overflow-hidden">
            <textarea
              ref={textareaRef} // Attach the ref
              value={content}
              onChange={handleContentChange}
              // Track cursor changes
              onClick={handleCursorChange}
              onKeyUp={handleCursorChange} // For arrow keys, backspace, delete etc.
              // onSelect={handleCursorChange} // Can be too frequent, use onClick/onKeyUp
              placeholder="Enter your slides here, separated by '---'"
              className="w-full sm:w-2/3 h-full p-4 border border-gray-300 rounded-md bg-gray-50 resize-none font-mono text-sm transition-all duration-300 ease-in-out"
            />
            <SlidesPreview
              content={content}
              activeSlideIndex={activeSlideIndex}
              onPreviewClick={handlePreviewClick} // Pass the handler down
              onAddSlide={handleAddSlide} // Pass the new handler
              className="hidden sm:block sm:w-1/3 h-full transition-all duration-300 ease-in-out"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-4">
            <div className="flex justify-between sm:justify-start gap-2 sm:gap-4 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handleImport}
                title="Import Markdown"
                className="flex items-center text-xs sm:text-sm h-8 px-2"
              >
                <Upload className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                Import
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                title="Download Markdown"
                className="flex items-center text-xs sm:text-sm h-8 px-2"
              >
                <Download className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                Export
              </Button>
              <Dialog
                open={isShareDialogOpen}
                onOpenChange={setIsShareDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    title="Share Presentation"
                    className="flex items-center text-xs sm:text-sm h-8 px-2"
                  >
                    <Share2 className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                    Share
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white">
                  <DialogHeader>
                    <DialogTitle>Share Presentation</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center p-4">
                    {shareUrl && (
                      <>
                        <QRCodeReact.QRCodeCanvas
                          value={shareUrl}
                          size={256}
                          className="mb-4"
                        />
                        <p className="text-sm text-muted-foreground text-center">
                          Scan this code or share the link to view this
                          presentation.
                        </p>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                onClick={handleNewPresentation}
                className="flex items-center text-xs sm:text-sm h-8 px-2"
                title="Start a new presentation (Esc)"
              >
                <Plus className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                New
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Input for Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".md,.markdown,text/markdown" // Specify accepted file types
        style={{ display: "none" }} // Hide the element visually
      />
    </div>
  );
};

export default HomePage;
