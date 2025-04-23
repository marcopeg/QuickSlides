# Active Context

*   **Current Focus:** Implement specific image rendering logic (full-slide vs inline).
*   **Recent Changes:** Implemented fullscreen toggle ('f' key). Implemented sliding transition animation between slides using a new `Carousel` component and refactoring `App.tsx` and `SlidePage.tsx`.
*   **Next Steps:** Determine how to identify slides with only an image vs. mixed content. Implement rendering logic in `SlidePage.tsx` or a custom markdown component.
*   **Open Questions/Decisions:** How to handle image rendering rules robustly? What's the best way to parse/detect image-only slides?
*   **Blockers:** Path alias issue might need further investigation later if relative paths become cumbersome.