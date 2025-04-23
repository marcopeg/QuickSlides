# Active Context

*   **Current Focus:** Implement specific image rendering logic (full-slide vs inline).
*   **Recent Changes:** Implemented `HomePage` component (`/`) with textarea for editing slide markdown, storing content in local storage (`quickslides-content`). Updated `useSlides` hook to read from local storage first, falling back to `slides.md`. Removed root redirect. Added 'Esc' key listener in slide view (`App.tsx`) to navigate back to the homepage (`/`).
*   **Next Steps:** Implement specific image rendering logic in `SlidePage.tsx` or a custom markdown component.
*   **Open Questions/Decisions:** How to handle image rendering rules robustly? What's the best way to parse/detect image-only slides?
*   **Blockers:** Path alias issue (`@/`) persists despite configuration; using relative paths as workaround. Shadcn UI components (`Button`, `Textarea`) missing; used standard HTML elements instead.