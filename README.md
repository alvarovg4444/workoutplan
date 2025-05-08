# 3-Day Strength-Training Logger

A simple, mobile-first vanilla JavaScript web application for logging strength training sessions. Data is stored locally in the browser using `localStorage`.

## Features

* **Three Workout Tabs:** Dedicated tabs for Day 1 (Squat Focus), Day 2 (Overhead Press Focus), and Day 3 (Deadlift Focus).
* **Data Entry:** Log body-weight, main lift weight, reps for 5 sets, AMRAP reps and RPE for the final set.
* **Accessory Work:** Optional collapsible sections to log weights and reps for accessory exercises.
* **Notes:** A multi-line text area for any session-specific notes.
* **Log Session:** Saves the current session data with a timestamp to `localStorage`.
* **Logs Tab:**
    * Displays a list of all logged sessions, newest first.
    * Filter sessions by Day (All, Day 1, Day 2, Day 3).
    * Export all logged data to an Excel (`.xlsx`) file.
* **Routine Info Tab:** Static HTML content explaining the training plan, glossary, warm-up, progression, and safety.
* **Pure Vanilla Stack:** Built with HTML, CSS, and JavaScript. No frameworks.
* **External Libraries:** Uses SheetJS (`xlsx.full.min.js`) for Excel export and FileSaver.js (via CDN) for triggering file downloads.
* **Offline Capable:** Works without an internet connection once loaded (assets are local or cached).
* **Mobile-First Design:** Styled for a 360px-wide viewport, responsive for larger screens.

## File Structure
.
├── index.html          (Main HTML structure and tab content)
├── styles.css          (All CSS styling)
├── app.js              (Core application logic: tab switching, form handling, UI updates)
├── data.js             (Handles localStorage interaction: saving, fetching, and data export logic)
├── /lib
│   └── xlsx.full.min.js (SheetJS library for Excel export)
└── README.md           (This file)


## Core Requirements Covered

1.  **Navigation:**
    * Five bottom tabs implemented with JavaScript-driven content switching.
    * Defaults to "Day 1" screen.
2.  **Workout Tabs (Day 1, 2, 3):**
    * Headers (e.g., "Day 1 – Squat Focus").
    * Fields for body-weight, main lift weight, Set 1-5 reps (prefilled).
    * Checkbox for AMRAP final set (checked by default).
        * Shows "AMRAP reps" and RPE slider when checked.
    * Collapsible `<details>` block for accessory work with input pairs.
    * Multiline `<textarea>` for Notes.
    * "Log Session" button:
        * Reads all inputs.
        * Generates a JS object `{ dayId:X, timestamp: Date.now(), ... }`.
        * Pushes into `localStorage` array "v1_sessions".
        * Shows a toast notification (e.g., "Day 1 saved 🎉").
3.  **Logs Tab:**
    * Dynamic list of logged sessions (cards), newest-first.
    * Card header: "Fri May 09 2025 · Day 1".
    * Card body: Main lift weight, AMRAP details, notes.
    * Filter chips: All | Day 1 | Day 2 | Day 3.
    * "Export to Excel (.xlsx)" button:
        * Builds a flat sheet with specified columns.
        * Downloads using SheetJS and FileSaver.js.
4.  **Routine Info Tab:**
    * Static HTML content as provided.
5.  **Styling:**
    * Mobile-first (360px target), flex column layouts.
    * Fixed 56px tab bar; content area scrolls.
    * CSS variables for theme colors.
    * Primary buttons: full-width, `border-radius: 6px`.
    * Minimal CSS reset (`box-sizing`).
6.  **Accessibility & UX:**
    * Inputs labelled with `<label for>`.
    * `type="number"` for weights/reps; `step` attributes used.
    * "Log Session" button disabled if the main-weight field is empty.
    * `localStorage` key versioning (`v1_sessions`).
7.  **Accessory Lists:** Hard-coded in `index.html` for each day.

## Setup and Running

1.  **Clone/Download:**
    Get all the files and place them in a single directory called `strength-logger` (or any name you prefer) maintaining the specified file structure.

2.  **Get SheetJS:**
    * Download `xlsx.full.min.js` from [https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js](https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js).
    * Place this file inside the `lib/` sub-directory.

3.  **Open in Browser:**
    * Simply open the `index.html` file in a modern web browser (like Chrome or Safari, preferably their mobile versions for testing the primary design target).
    * No build step or local server is strictly required for basic functionality, as it's pure client-side code. However, some browser security features (especially around file exports if not served via HTTP/S) might behave better if you use a simple local server.

4.  **Using a Local Server (Optional but Recommended for Development):**
    If you have Node.js installed, you can use a simple HTTP server:
    * Navigate to the project's root directory in your terminal.
    * Install `http-server` globally (if you haven't already):
        ```bash
        npm install -g http-server
        ```
    * Start the server:
        ```bash
        http-server
        ```
    * Open your browser and go to the local address provided (usually `http://localhost:8080`).

## Testing

* Test primarily in Chrome Mobile and Safari Mobile (using browser developer tools for emulation is a good start).
* Verify all form inputs, data saving to localStorage (check via browser dev tools > Application > Local Storage).
* Test session logging for all three days.
* Test the Logs tab: filtering, display of log cards.
* Test the Excel export functionality.
* Test navigation and display of the Info tab.
* Ensure the UI is responsive and usable on small screens.

## Notes

* **Main Lift Focus:** The main lift for Day 3 is set to "Deadlift Focus" in the HTML. This can be changed (e.g., to Bench Press) by editing the header and accessory lists in `index.html` and potentially adjusting prefilled reps in `app.js` if desired.
* **Prefilled Reps:** `app.js` includes logic to prefill set reps (e.g., 3 reps for Day 1, a 3/2 split for Day 2, and 2 reps for Day 3 main lifts). This is a basic example and can be customized.
* **Icons:** Font Awesome is commented out in `index.html`. If you wish to use it, uncomment the link and add `<i class="..."></i>` tags to your tab buttons or other elements.
