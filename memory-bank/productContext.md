# Product Context

*   **Problem:** the user needs a slide deck to support a live presentation
*   **Goal:** show slides on a big screen
*   **Target User:** anyone that presents contents
*   **Key Features:** render a slide, move between slides, enter full-screen
*   **Non-Goals:** editing the slide deck
*   **Success Metrics:** works on my machine

# Product Backlog

- [x] Setup
    - [x] Install & Setup ReactRouter
    - [x] Install & Setup TailwindCSS
    - [x] Install & Setup Shadcn/UI
- [x] Data
    - [x] Create an example file "slides.md" that contain the slides for a Star Wars presentation. The slide separator is "---".
    - [x] Read and parse the "slides.md" to create the in-memory presentation data
    - [x] Setup the routes to render a slide based on a URL param
    - [x] Setup the entry page (/) to render the first slide
- [ ] Navigation
    - [x] Support arrow keys to navigate to next/prev slide
    - [ ] Animate the slide transition with a sliding effect
    - [ ] Support the key "f" to enter/exit full-screen
- [ ] Slide rendering
    - [x] Render basic markdown in a slide
    - [ ] If a slide has only one image in it, render it so that it covers the entire slide
    - [ ] If a slide has text + image, render the image inline