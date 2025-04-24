import React from "react";
import MarkdownSlide from "./MarkdownSlide"; // Use relative path
import CoverSlide from "./CoverSlide"; // Use relative path
import SplitCoverSlide from "./SplitCoverSlide"; // Import the new component

interface SlideProps {
  content: string;
}

// Regex to match a string containing *only* a single markdown image
const singleImageRegex = /^\s*!\[.*?\]\((.+?)\)\s*$/;
// Regex to find *all* markdown images globally
const allImagesRegex = /!\[.*?\]\((.+?)\)/g;

const Slide: React.FC<SlideProps> = ({ content }) => {
  const processedContent = String(content || "");
  const trimmedContent = processedContent.trim();

  // --- Check for exactly two images ---
  const allImageMatches = [...processedContent.matchAll(allImagesRegex)]; // Find all image tags
  const remainingContent = processedContent.replace(allImagesRegex, "").trim(); // Remove images and trim

  if (allImageMatches.length === 2 && remainingContent === "") {
    // Exactly two images and nothing else
    const urls = allImageMatches.map((match) => match[1]);
    if (urls.length === 2 && urls[0] && urls[1]) {
      // Ensure URLs were extracted
      return <SplitCoverSlide imageUrl1={urls[0]} imageUrl2={urls[1]} />;
    }
  }

  // --- Check for exactly one image (original check) ---
  const singleImageMatch = trimmedContent.match(singleImageRegex);
  if (singleImageMatch && singleImageMatch[1]) {
    const imageUrl = singleImageMatch[1];
    return <CoverSlide imageUrl={imageUrl} />;
  }

  // --- Fallback to MarkdownSlide ---
  return <MarkdownSlide content={processedContent} />;
};

export default Slide;
