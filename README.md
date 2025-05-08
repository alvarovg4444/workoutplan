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
