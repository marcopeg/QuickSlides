import React from 'react';

interface CarouselProps {
  children: React.ReactNode[]; // Expect an array of slide elements
  activeIndex: number;
}

const Carousel: React.FC<CarouselProps> = ({ children, activeIndex }) => {
  return (
    <div className="carousel w-full h-full overflow-hidden">
      <div
        className="slide-track flex h-full transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {React.Children.map(children, (child, index) => (
          <div key={index} className="slide flex-shrink-0 w-full h-full">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel; 