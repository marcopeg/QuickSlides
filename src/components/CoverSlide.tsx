import React from "react";

interface CoverSlideProps {
  imageUrl: string;
}

const CoverSlide: React.FC<CoverSlideProps> = ({ imageUrl }) => {
  return (
    <div
      className="cover-slide w-full h-full bg-cover bg-center"
      style={{ backgroundImage: `url(${imageUrl})` }}
      aria-label="Slide with cover image"
    />
  );
};

export default CoverSlide;
