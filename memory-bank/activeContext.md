# Active Context

*   **Current Focus:** Implement slide rendering (basic markdown).
*   **Recent Changes:** Implemented basic routing (`/`, `/slide/:id`) using React Router. Created `SlidePage` component that fetches slide data via `useSlides` hook and handles invalid slide numbers by redirecting to slide 1.
*   **Next Steps:** Integrate a markdown rendering library (e.g., `react-markdown`) into `SlidePage` to display formatted content instead of raw markdown.
*   **Open Questions/Decisions:** Which markdown library to use? `react-markdown` is popular. How to handle images within markdown?
*   **Blockers:** None currently identified.