# Active Context

*   **Current Focus:** Implement specific image rendering logic (full-slide vs inline).
*   **Recent Changes:** Implemented a VSCode-inspired dark theme. Enforced dark mode globally (`main.tsx`), updated Shadcn/ui CSS variables (`index.css`) with a new color palette, removed light theme variables, and corrected Tailwind directives.
*   **Next Steps:** Implement specific image rendering logic in `SlidePage.tsx` or a custom markdown component.
*   **Open Questions/Decisions:** How to handle image rendering rules? (Button visibility in dark mode should be resolved by the new theme).
*   **Blockers:** Missing Shadcn components (need verification if still an issue after theme update).