document.addEventListener('DOMContentLoaded', () => {
    const APP_STORAGE_KEY = 'strengthLogPro_v1'; // Updated key for new data structure

    const EXERCISES_BY_DAY = {
        1: [
            { id: 'back_squat', label: 'Back-squat' },
            { id: 'paused_bench_press', label: 'Paused bench press' },
            { id: 'romanian_deadlift', label: 'Romanian deadlift' },
            { id: 'db_split_squat', label: 'Dumb-bell split-squat (per leg)' },
            { id: 'incline_db_press', label: 'Incline dumb-bell press' }
        ],
        2: [
            { id: 'bench_press_normal', label: 'Bench press (normal pause)' },
            { id: 'barbell_pendlay_row', label: 'Barbell or Pendlay row' },
            { id: 'overhead_press', label: 'Overhead press' },
            { id: 'weighted_pullups_lat_pulldowns', label: 'Weighted pull-ups / Lat pull-downs' },
            { id: 'rear_delt_fly', label: 'Rear-delt fly' }
        ],
        3: [
            { id: 'deadlift', label: 'Deadlift' },
            { id: 'front_squat', label: 'Front squat' },
            { id: 'close_grip_bench_dips', label: 'Close-grip bench or Dips' },
            { id: 'leg_press_hack_squat', label: 'Leg press or Hack squat' },
            { id: 'ez_bar_curl', label: 'EZ-bar Curl' },
            { id: 'triceps_pushdown', label: 'Triceps Push-down' }
        ]
    };

    // --- Initialize Forms ---
    function populateExerciseForms() {
        for (const dayId in EXERCISES_BY_DAY) {
            const form = document.getElementById(`day${dayId}-form`);
            if (form) {
                let formHTML = `<input type="hidden" name="dayId" value="${dayId}">`;
                EXERCISES_BY_DAY[dayId].forEach(exercise => {
                    formHTML += `
                        <div class="exercise-group">
                            <label for="exercise_${exercise.id}_day${dayId}">${exercise.label} (kg)</label>
                            <input type="number" id="exercise_${exercise.id}_day${dayId}" name="exercise_${exercise.id}" step="0.5" inputmode="decimal" placeholder="Weight">
                        </div>
                    `;
                });
                formHTML += `<button type="submit" class="btn-primary">Log Day ${dayId} Lifts</button>`;
                form.innerHTML = formHTML;
            }
        }
    }
    populateExerciseForms();


    // --- Tab Navigation ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const defaultTabId = 'day1-content';

    function switchTab(targetTabId) {
        tabContents.forEach(content => content.classList.remove('active-tab'));
        document.getElementById(targetTabId)?.classList.add('active-tab');

        tabButtons.forEach(button => {
            button.classList.remove('active-tab-button');
            if (button.dataset.tab === targetTabId) {
                button.classList.add('active-tab-button');
            }
        });
        if (targetTabId === 'logs-content') renderLogs();
    }
    tabButtons.forEach(button => button.addEventListener('click', () => switchTab(button.dataset.tab)));
    switchTab(defaultTabId);


    // --- Form Handling ---
    document.querySelectorAll('.lift-form').forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(form);
            const dayId = parseInt(formData.get('dayId'));
            const sessionLifts = [];
            let hasData = false;

            EXERCISES_BY_DAY[dayId].forEach(exercise => {
                const weightValue = formData.get(`exercise_${exercise.id}`);
                if (weightValue && weightValue.trim() !== '') {
                    const weight = parseFloat(weightValue);
                    if (!isNaN(weight) && weight > 0) {
                        sessionLifts.push({
                            exerciseId: exercise.id,
                            exerciseLabel: exercise.label,
                            weight: weight
                        });
                        hasData = true;
                    }
                }
            });

            if (!hasData) {
                showToast('Please enter weight for at least one exercise.');
                return;
            }

            const logEntry = {
                id: Date.now(),
                timestamp: Date.now(),
                dayId: dayId,
                lifts: sessionLifts
            };

            saveLogEntry(logEntry);
            showToast(`Day ${dayId} lifts logged! 👍`);
            form.reset();
        });
    });


    // --- LocalStorage Functions ---
    function getLogEntries() {
        const entriesJSON = localStorage.getItem(APP_STORAGE_KEY);
        return entriesJSON ? JSON.parse(entriesJSON) : [];
    }

    function saveLogEntry(entry) {
        const entries = getLogEntries();
        entries.push(entry);
        entries.sort((a, b) => b.timestamp - a.timestamp); // Newest first
        localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(entries));
    }


    // --- Render Logs ---
    const logsListContainer = document.getElementById('logs-list');
    function renderLogs() {
        if (!logsListContainer) return;
        logsListContainer.innerHTML = '';
        const entries = getLogEntries();

        if (entries.length === 0) {
            logsListContainer.innerHTML = '<p style="text-align:center; color:#6c757d; padding:20px 0;">No sessions logged yet.</p>';
            return;
        }

        entries.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'log-card';
            const date = new Date(entry.timestamp);
            const formattedDate = date.toLocaleDateString(undefined, {
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            let liftsHTML = '<div class="log-card-lifts">';
            entry.lifts.forEach(lift => {
                liftsHTML += `<div><strong>${lift.exerciseLabel}:</strong> <span>${lift.weight} kg</span></div>`;
            });
            liftsHTML += '</div>';

            card.innerHTML = `
                <div class="log-card-header">
                    <span class="log-card-day">Day ${entry.dayId}</span> &ndash; ${formattedDate}
                </div>
                ${liftsHTML}
            `;
            logsListContainer.appendChild(card);
        });
    }

    // --- Toast Notification ---
    const toastElement = document.getElementById('toast-message');
    let toastTimeout;
    function showToast(message) {
        if (!toastElement) return;
        clearTimeout(toastTimeout);
        toastElement.textContent = message;
        toastElement.classList.add('show');
        toastTimeout = setTimeout(() => toastElement.classList.remove('show'), 3000);
    }

    // --- Excel Export ---
    const exportButton = document.getElementById('export-excel');
    if (exportButton) {
        exportButton.addEventListener('click', exportSessionsToExcel);
    }

    function getAllExerciseHeaders() {
        const headers = new Set();
        Object.values(EXERCISES_BY_DAY).forEach(dayExercises => {
            dayExercises.forEach(ex => headers.add(ex.label)); // Use label for header
        });
        return ['Timestamp', 'Day ID', ...Array.from(headers).sort()];
    }

    function exportSessionsToExcel() {
        const sessions = getLogEntries();
        if (sessions.length === 0) {
            showToast("No data to export.");
            return;
        }

        const exerciseHeaders = getAllExerciseHeaders().slice(2); // Get only exercise labels, sorted
        const dataForSheet = sessions.map(session => {
            const row = {
                'Timestamp': new Date(session.timestamp).toLocaleString(),
                'Day ID': session.dayId
            };
            // Initialize all exercise columns for this row
            exerciseHeaders.forEach(header => row[header] = '');

            // Populate weights for logged exercises
            session.lifts.forEach(lift => {
                if (row.hasOwnProperty(lift.exerciseLabel)) {
                    row[lift.exerciseLabel] = lift.weight;
                }
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(dataForSheet, { header: ['Timestamp', 'Day ID', ...exerciseHeaders] });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Strength Logs");

        // Generate filename with current date
        const today = new Date();
        const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
        const fileName = `StrengthLogPro_Export_${dateStr}.xlsx`;

        try {
            XLSX.writeFile(workbook, fileName);
            showToast("Exporting to Excel...");
        } catch (err) {
            showToast("Error exporting data. See console.");
            console.error("Excel export error:", err);
        }
    }

    // Initial render if logs tab is active (though it's not by default)
    if (document.querySelector('.tab-button.active-tab-button[data-tab="logs-content"]')) {
        renderLogs();
    }
});
