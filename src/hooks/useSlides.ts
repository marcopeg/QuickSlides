import { useMemo } from 'react';
// Import raw markdown content using Vite's ?raw suffix
// The `@` alias should resolve to the `src` directory based on tsconfig.json
// import slideContent from '@/slides.md?raw'; // Alias caused issue
import slideContent from '../slides.md?raw'; // Using relative path

/**
 * Custom hook to parse the raw slide markdown content into an array of slides.
 * It memoizes the result to avoid re-parsing on every render.
 */
export function useSlides(): string[] {
  const slides = useMemo(() => {
    if (!slideContent) {
      return [];
    }
    // Split by '---' separator on its own line, potentially surrounded by newlines
    // Trim whitespace from each slide and filter out any empty slides
    return slideContent
      .split(/\n---\n/)
      .map(slide => slide.trim())
      .filter(slide => slide.length > 0);
  }, []); // Dependency array is empty, so parsing happens once

  return slides;
} 