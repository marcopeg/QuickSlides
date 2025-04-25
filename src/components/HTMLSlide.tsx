import React, { useEffect, useRef } from "react";
// Import the compiled Tailwind CSS as a string using Vite's ?inline query
// Adjust the path if your main CSS file is located elsewhere
import tailwindStyles from "/src/index.css?inline";

interface HTMLSlideProps {
  content: string;
}

const HTMLSlide: React.FC<HTMLSlideProps> = ({ content }) => {
  const shadowHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hostElement = shadowHostRef.current;
    if (!hostElement) return;

    // Ensure we only attach shadow root once
    let shadowRoot = hostElement.shadowRoot;
    if (!shadowRoot) {
      shadowRoot = hostElement.attachShadow({ mode: "open" });
    }

    // Inject Tailwind styles and user content
    shadowRoot.innerHTML = `
      <style>
        ${tailwindStyles}
        /* Ensure the host takes full size if needed, although the parent div handles it */
        :host {
          display: block; /* Ensure the host behaves like a block element */
          width: 100%;
          height: 100%;
        }
        /* Scope html/body styles within shadow DOM if necessary */
        html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
        }
        /* Add a wrapper for the content if direct innerHTML causes issues */
        .content-wrapper {
             width: 100%;
             height: 100%;
        }
      </style>
      <div class="content-wrapper">${content}</div>
    `;
  }, [content]); // Re-run effect if content changes

  return (
    // This outer div still ensures the component takes up slide space
    <div className="w-full h-full">
      {/* This div will host the shadow root */}
      <div ref={shadowHostRef} className="w-full h-full"></div>
    </div>
  );
};

export default HTMLSlide;
