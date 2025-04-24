import React from "react";

interface SplitCoverSlideProps {
  imageUrl1: string;
  imageUrl2: string;
}

const SplitCoverSlide: React.FC<SplitCoverSlideProps> = ({
  imageUrl1,
  imageUrl2,
}) => {
  return (
    <div className="split-cover-slide relative w-full h-full overflow-hidden">
      {/* Image 1: Top-Left Triangle */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl1})`,
          clipPath: "polygon(0 0, 100% 0, 0 100%)", // Top-left triangle
        }}
        aria-label="Top-left part of split cover image"
      />
      {/* Image 2: Bottom-Right Triangle */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl2})`,
          clipPath: "polygon(100% 0, 100% 100%, 0 100%)", // Bottom-right triangle
        }}
        aria-label="Bottom-right part of split cover image"
      />
    </div>
  );
};

export default SplitCoverSlide;
