import React from "react";

interface HTMLSlideProps {
  content: string;
}

const HTMLSlide: React.FC<HTMLSlideProps> = ({ content }) => {
  return (
    <div
      className="w-full h-full"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default HTMLSlide;
