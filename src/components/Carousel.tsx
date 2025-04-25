import React, { useState } from "react";
import { useDrag } from "@use-gesture/react";

interface CarouselProps {
  children: React.ReactNode[]; // Expect an array of slide elements
  activeIndex: number;
  onSwipeLeft?: () => void; // Callback for next slide
  onSwipeRight?: () => void; // Callback for previous slide
  onSwipeVertical?: () => void; // Callback for exit
}

const Carousel: React.FC<CarouselProps> = ({
  children,
  activeIndex,
  onSwipeLeft,
  onSwipeRight,
  onSwipeVertical,
}) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false); // State to track drag status

  // --- Gesture Handling ---
  const bind = useDrag(
    ({
      movement: [mx],
      direction: [dx],
      axis,
      distance,
      velocity: [vx],
      tap,
      active, // Use 'active' to set isDragging
      last,
    }) => {
      // Set dragging state based on 'active'
      // Debounce slightly or ensure it's set correctly on start/end
      // This might need adjustment if the first event doesn't reflect 'active' correctly
      if (active && !isDragging) {
        setIsDragging(true);
      }

      // --- Vertical Swipe Detection (Exit) ---
      if (axis === "y" && distance[1] > 50 && last && !tap && onSwipeVertical) {
        console.log("Vertical swipe detected");
        setIsDragging(false); // Ensure dragging is false on exit
        setDragOffset(0); // Reset offset
        onSwipeVertical();
        return; // Don't process horizontal if vertical swipe triggered exit
      }

      // --- Horizontal Swipe & Drag Effect ---
      if (axis === "x" && !tap) {
        // Update visual offset during drag only when active
        if (active) {
          setDragOffset(mx);
        } else {
          // If not active but axis was x (e.g., drag ended), ensure dragging is false
          // Though the 'last' block handles the main logic
        }

        // On drag end (last event)
        if (last) {
          setIsDragging(false); // Turn off dragging state to re-enable transition
          const threshold = window.innerWidth / 4; // Swipe threshold
          const velocityThreshold = 0.3; // Velocity threshold

          // Determine if it's a significant swipe left or right
          if (Math.abs(mx) > threshold || Math.abs(vx) > velocityThreshold) {
            if (dx > 0 && onSwipeRight) {
              console.log("Swipe Right");
              onSwipeRight();
            } else if (dx < 0 && onSwipeLeft) {
              console.log("Swipe Left");
              onSwipeLeft();
            }
          }
          // Reset visual offset *after* transition is potentially re-enabled
          // The state update for activeIndex will trigger the slide change
          setDragOffset(0);
        }
      } else if (last) {
        // If drag ends without significant movement or on wrong axis, reset offset
        setIsDragging(false); // Ensure dragging state is off
        setDragOffset(0);
      }
    },
    {
      axis: "lock", // Lock axis early based on initial movement
      filterTaps: true, // Ignore brief taps that are likely clicks
      threshold: 10, // Minimum pixel movement to trigger drag
    }
  );
  // --- End Gesture Handling ---

  // Conditionally apply transition classes
  const slideTrackClasses = [
    "slide-track",
    "flex",
    "h-full",
    !isDragging ? "transition-transform duration-300 ease-in-out" : "", // Only apply transition when not dragging
  ].join(" ");

  return (
    <div
      {...bind()}
      className="carousel w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ touchAction: "pan-y" }}
    >
      <div
        className={slideTrackClasses} // Use dynamic classes
        style={{
          transform: `translateX(calc(-${
            activeIndex * 100
          }% + ${dragOffset}px))`,
          touchAction: "none",
        }}
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
