# Active Context

*   **Current Focus:** Setup slide routing (`/` and `/slide/:id`).
*   **Recent Changes:** Created `useSlides` hook (`src/hooks/useSlides.ts`) to parse `src/slides.md` using Vite's `?raw` import.
*   **Next Steps:** Define routes in the main application component (`App.tsx` likely) using React Router. Create a basic `Slide` component placeholder.
*   **Open Questions/Decisions:** How to handle invalid slide numbers in the URL? (Redirect to /slide/1? Show 404?).
*   **Blockers:** None currently identified.