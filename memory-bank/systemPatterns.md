# System Patterns

*   **Architecture Overview:** React PWA application using Vite, React Router, TailwindCSS, Shadcn/UI.
*   **Key Components:** `App` (Routing, Keyboard Nav, Fullscreen), `SlidesViewer` (inside App, fetches active slide, renders Carousel), `Carousel` (Handles sliding animation, displays slides), `SlidePage` (Renders single slide markdown), `useSlides` (Hook for parsing `slides.md`).
*   **Data Flow:** `slides.md` -> `useSlides` -> `App`/`SlidesViewer` -> `Carousel` -> `SlidePage`.
*   **State Management:** Current slide index primarily managed via URL parameters (`/slide/:slideNumber`). Fullscreen state managed via browser API.
*   **Design Patterns:** Container/Presentational (App/SlidesViewer manage state, Carousel/SlidePage display), Hooks (`useSlides`).
*   **API Design:** n/a
*   **Important Decisions:** URL-based state management for slides. CSS transform/transition for slide animation within `Carousel` component.