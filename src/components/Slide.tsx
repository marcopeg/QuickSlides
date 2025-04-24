import React from "react";
import MarkdownSlide from "./MarkdownSlide"; // Use relative path
import CoverSlide from "./CoverSlide"; // Use relative path

interface SlideProps {
  content: string;
}

// Regex to match a string containing only a markdown image
const singleImageRegex = /^\s*!\[.*?\]\((.+?)\)\s*$/;

const Slide: React.FC<SlideProps> = ({ content }) => {
  const trimmedContent = String(content || "").trim();
  const match = trimmedContent.match(singleImageRegex);

  if (match && match[1]) {
    const imageUrl = match[1];
    return <CoverSlide imageUrl={imageUrl} />;
  } else {
    // Render markdown if it's not a single image
    return <MarkdownSlide content={content} />;
  }
};

export default Slide;
