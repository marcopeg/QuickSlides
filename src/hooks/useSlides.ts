import { useMemo, useState, useEffect } from "react";
// Import raw markdown content using Vite's ?raw suffix
// The `@` alias should resolve to the `src` directory based on tsconfig.json
import defaultSlideContent from "@/slides.md?raw"; // Now using proper path alias

const LOCAL_STORAGE_KEY = "quickslides-content";

/**
 * Custom hook to parse slide markdown content into an array of slides.
 * Reads from localStorage first, falling back to the default slides.md content.
 * It memoizes the result based on the raw content used.
 */
export function useSlides(): string[] {
  // State to hold the raw content (either from localStorage or default file)
  const [rawContent, setRawContent] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs on the client side after mount
    const storedContent = localStorage.getItem(LOCAL_STORAGE_KEY);
    setRawContent(storedContent ?? defaultSlideContent);

    // Optional: Listener for external local storage changes (e.g., from another tab)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_KEY) {
        setRawContent(event.newValue ?? defaultSlideContent);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []); // Runs once on mount

  const slides = useMemo(() => {
    if (rawContent === null) {
      // Content not yet loaded from useEffect
      return [];
    }
    // Split by '---' separator on its own line, potentially surrounded by newlines
    // Trim whitespace from each slide and filter out any truly empty slides
    return rawContent
      .split(/\r?\n---\r?\n/)
      .filter((slide) => slide.trim().length > 0);
  }, [rawContent]); // Re-parse only when rawContent changes

  return slides;
}
