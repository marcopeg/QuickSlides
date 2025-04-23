# Product Context

*   **Problem:** the user needs a slide deck to support a live presentation
*   **Goal:** show slides on a big screen, allow quick edits before presenting
*   **Target User:** anyone that presents contents
*   **Key Features:** render a slide, move between slides, enter full-screen, basic markdown editing via homepage textarea (persisted in local storage)
*   **Non-Goals:** ~~editing the slide deck~~ (Basic editing added via HomePage), advanced editing features, user accounts, cloud storage.
*   **Success Metrics:** works on my machine

# Product Backlog

- [x] Setup
    - [x] Install & Setup ReactRouter
    - [x] Install & Setup TailwindCSS
    - [x] Install & Setup Shadcn/UI (Note: Initialization done, but components like Button/Textarea seem missing/not found at expected paths)
- [x] Data
    - [x] Create an example file "slides.md" that contain the slides for a Star Wars presentation. The slide separator is "---".
    - [x] Read and parse the "slides.md" to create the in-memory presentation data (Initial implementation)
    - [x] Setup the routes to render a slide based on a URL param (`/slide/:slug`)
    - [~] Setup the entry page (/) to render the first slide (Superseded by HomePage)
    - [x] Implement `HomePage` (`/`) with textarea for editing, using local storage for persistence.
    - [x] Update slide parsing (`useSlides`) to read from local storage first, then fallback to `slides.md`.
- [ ] Navigation
    - [x] Support arrow keys to navigate to next/prev slide
    - [x] Animate the slide transition with a sliding effect
    - [x] Support the key "f" to enter/exit full-screen
- [ ] Slide rendering
    - [x] Render basic markdown in a slide
    - [ ] If a slide has only one image in it, render it so that it covers the entire slide
    - [ ] If a slide has text + image, render the image inline