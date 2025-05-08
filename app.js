document.addEventListener('DOMContentLoaded', () => {
    const APP_STORAGE_KEY = 'strengthLogPro_v3_targetedAmrap'; // Updated key

    // Define exercises with sets, reps, and main lift indicator
    const EXERCISES_BY_DAY = {
        1: [ // Squat Day
            { id: 'back_squat', label: 'Back-squat', sets: 5, reps: '3', isMainLift: true },
            { id: 'paused_bench_press', label: 'Paused bench press', sets: 4, reps: '5' },
            { id: 'romanian_deadlift', label: 'Romanian deadlift', sets: 3, reps: '6' },
            { id: 'db_split_squat', label: 'Dumb-bell split-squat', sets: 3, reps: '8 per leg' },
            { id: 'incline_db_press', label: 'Incline dumb-bell press', sets: 3, reps: '10' }
        ],
        2: [ // Bench Press Day
            { id: 'bench_press_normal', label: 'Bench press (normal pause)', sets: 5, reps: '3', isMainLift: true },
            { id: 'barbell_pendlay_row', label: 'Barbell or Pendlay row', sets: 4, reps: '6' },
            { id: 'overhead_press', label: 'Overhead press', sets: 3, reps: '5' },
            { id: 'weighted_pullups_lat_pulldowns', label: 'Weighted pull-ups / Lat pull-downs', sets: 4, reps: '5' },
            { id: 'rear_delt_fly', label: 'Rear-delt fly', sets: 3, reps: '12' }
        ],
        3: [ // Deadlift Day
            { id: 'deadlift', label: 'Deadlift', sets: 5, reps: '2', isMainLift: true },
            { id: 'front_squat', label: 'Front squat', sets: 4, reps: '4' },
            { id: 'close_grip_bench_dips', label: 'Close-grip bench or Dips', sets: 3, reps: '6-8' },
            { id: 'leg_press_hack_squat', label: 'Leg press or Hack squat', sets: 3, reps: '10' },
            { id: 'ez_bar_curl', label: 'EZ-bar Curl', sets: 3, reps: '12' }, // Part of superset
            { id: 'triceps_pushdown', label: 'Triceps Push-down', sets: 3, reps: '12' } // Part of superset
        ]
    };

    // --- Initialize Forms ---
    function populateExerciseForms() {
        console.log("Populating exercise forms with targeted AMRAP and sets/reps info...");
        for (const dayIdKey in EXERCISES_BY_DAY) {
            if (EXERCISES_BY_DAY.hasOwnProperty(dayIdKey)) {
                const dayId = parseInt(dayIdKey);
                const form = document.getElementById(`day${dayId}-form`);
                const exercisesForDay = EXERCISES_BY_DAY[dayIdKey];

                if (form && exercisesForDay) {
                    let formContentHTML = `<input type="hidden" name="dayId" value="${dayId}">`;
                    exercisesForDay.forEach(exercise => {
                        formContentHTML += `
                            <div class="exercise-group">
                                <label for="exercise_weight_${exercise.id}_day${dayId}" class="label-weight">${exercise.label}</label>
                                <div class="sets-reps-info">${exercise.sets} sets × ${exercise.reps} reps</div>
                                <input type="number" id="exercise_weight_${exercise.id}_day${dayId}" name="exercise_weight_${exercise.id}" step="0.5" inputmode="decimal" placeholder="Weight (kg)">
                        `;
                        if (exercise.isMainLift) {
                            formContentHTML += `
                                <label for="exercise_amrap_reps_${exercise.id}_day${dayId}" class="label-amrap">${exercise.label} - AMRAP Reps (optional)</label>
                                <input type="number" id="exercise_amrap_reps_${exercise.id}_day${dayId}" name="exercise_amrap_reps_${exercise.id}" step="1" inputmode="numeric" placeholder="Reps">
                            `;
                        }
                        formContentHTML += `</div>`; // Close exercise-group
                    });
                    formContentHTML += `<button type="submit" class="btn-primary">Log Day ${dayId} Lifts</button>`;
                    form.innerHTML = formContentHTML;
                } else {
                    console.error(`Form or exercises not found for Day ${dayIdKey}.`);
                }
            }
        }
    }
    
    try {
        populateExerciseForms();
    } catch (error) {
        console.error("Error during populateExerciseForms:", error);
        showToast("Error setting up forms. See console.");
    }

    // --- Tab Navigation ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const defaultTabId = 'day1-content';

    function switchTab(targetTabId) {
        tabContents.forEach(content => content.classList.remove('active-tab'));
        const activeContent = document.getElementById(targetTabId);
        if (activeContent) {
            activeContent.classList.add('active-tab');
        } else {
            console.warn(`Target tab content '${targetTabId}' not found.`);
        }
        tabButtons.forEach(button => {
            button.classList.remove('active-tab-button');
            if (button.dataset.tab === targetTabId) {
                button.classList.add('active-tab-button');
            }
        });
        if (targetTabId === 'logs-content') renderLogs();
    }
    tabButtons.forEach(button => button.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.dataset.tab;
        if (targetTab) switchTab(targetTab);
    }));
    if (document.getElementById(defaultTabId)) {
        switchTab(defaultTabId);
    } else if (tabButtons.length > 0 && tabButtons[0].dataset.tab) {
        switchTab(tabButtons[0].dataset.tab);
    }

    // --- Form Handling ---
    document.querySelectorAll('.lift-form').forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(form);
            const dayIdString = formData.get('dayId');
            if (!dayIdString) {
                showToast("Error: Day ID missing."); return;
            }
            const dayId = parseInt(dayIdString);
            const sessionLifts = [];
            let hasEnteredData = false;

            const exercisesForCurrentDay = EXERCISES_BY_DAY[dayId];
            if (!exercisesForCurrentDay) {
                showToast("Error: Exercise definition missing."); return;
            }

            exercisesForCurrentDay.forEach(exercise => {
                const weightValue = formData.get(`exercise_weight_${exercise.id}`);
                let amrapRepsValue = null;
                if (exercise.isMainLift) {
                    amrapRepsValue = formData.get(`exercise_amrap_reps_${exercise.id}`);
                }
                
                let weight = null;
                let amrapReps = null;
                let exerciseHasData = false;

                if (weightValue && weightValue.trim() !== '') {
                    const parsedWeight = parseFloat(weightValue);
                    if (!isNaN(parsedWeight) && parsedWeight >= 0) {
                        weight = parsedWeight;
                        exerciseHasData = true;
                    }
                }

                if (exercise.isMainLift && amrapRepsValue && amrapRepsValue.trim() !== '') {
                    const parsedAmrapReps = parseInt(amrapRepsValue, 10);
                    if (!isNaN(parsedAmrapReps) && parsedAmrapReps >= 0) {
                        amrapReps = parsedAmrapReps;
                        exerciseHasData = true; // AMRAP reps also count as data
                    }
                }
                
                if (exerciseHasData) {
                    sessionLifts.push({
                        exerciseId: exercise.id,
                        exerciseLabel: exercise.label,
                        weight: weight, 
                        amrapReps: exercise.isMainLift ? amrapReps : null // Only store AMRAP for main lift
                    });
                    hasEnteredData = true;
                }
            });

            if (!hasEnteredData) {
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
        try {
            return entriesJSON ? JSON.parse(entriesJSON) : [];
        } catch (e) {
            console.error("Error parsing log entries:", e);
            localStorage.removeItem(APP_STORAGE_KEY); 
            return [];
        }
    }
    function saveLogEntry(entry) {
        const entries = getLogEntries();
        entries.push(entry);
        entries.sort((a, b) => b.timestamp - a.timestamp); 
        try {
            localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(entries));
        } catch (e) {
            console.error("Error saving to localStorage:", e);
            showToast("Error saving data. Storage might be full.");
        }
    }

    // --- Render Logs ---
    const logsListContainer = document.getElementById('logs-list');
    function renderLogs() {
        if (!logsListContainer) return;
        logsListContainer.innerHTML = '';
        const entries = getLogEntries();

        if (entries.length === 0) {
            logsListContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:20px 0;">No sessions logged yet.</p>';
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
            if (entry.lifts && entry.lifts.length > 0) {
                entry.lifts.forEach(lift => {
                    // Find the exercise definition to check if it's a main lift for AMRAP display
                    const dayExercises = EXERCISES_BY_DAY[entry.dayId] || [];
                    const exerciseDef = dayExercises.find(ex => ex.id === lift.exerciseId);

                    liftsHTML += `<div class="lift-entry">
                                    <span class="exercise-name">${lift.exerciseLabel || 'N/A'}:</span>
                                    <span class="lift-details">`;
                    if (typeof lift.weight === 'number') {
                        liftsHTML += `<span class="weight-value">${lift.weight} kg</span>`;
                    }
                    // Only show AMRAP if it's a main lift and AMRAP reps were recorded
                    if (exerciseDef?.isMainLift && typeof lift.amrapReps === 'number') {
                        liftsHTML += `<span class="amrap-value">${lift.amrapReps} AMRAP</span>`;
                    }
                    liftsHTML += `   </span>
                                </div>`;
                });
            } else {
                liftsHTML += '<div>No specific lifts recorded.</div>';
            }
            liftsHTML += '</div>';

            card.innerHTML = `
                <div class="log-card-header">
                    <span class="log-card-day">Day ${entry.dayId || 'N/A'}</span> &ndash; ${formattedDate}
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
        if (!toastElement) { console.log("Toast:", message); return; }
        clearTimeout(toastTimeout);
        toastElement.textContent = message;
        toastElement.classList.add('show');
        toastTimeout = setTimeout(() => toastElement.classList.remove('show'), 3000);
    }

    // --- Excel Export ---
    const exportButton = document.getElementById('export-excel');
    if (exportButton) exportButton.addEventListener('click', exportSessionsToExcel);

    function getAllExerciseHeadersForExcel() {
        const headers = [];
         // Collect all unique exercises with their main lift status
        const uniqueExercises = {}; // Use an object to store unique exercises by ID
        Object.values(EXERCISES_BY_DAY).forEach(dayExercises => {
            if (Array.isArray(dayExercises)) {
                dayExercises.forEach(ex => {
                    // Store by ID to ensure each exercise (even if appearing on multiple days) is processed once for headers
                    if (!uniqueExercises[ex.id]) { 
                        uniqueExercises[ex.id] = { label: ex.label, isMainLift: !!ex.isMainLift };
                    }
                });
            }
        });

        // Sort unique exercises by label for consistent column order in Excel
        const sortedExercises = Object.values(uniqueExercises).sort((a,b) => a.label.localeCompare(b.label));
        
        const finalHeaders = ['Timestamp', 'Day ID'];
        sortedExercises.forEach(ex => {
            finalHeaders.push(`${ex.label} - Weight (kg)`);
            if (ex.isMainLift) { // Only add AMRAP column for exercises that are designated as main lifts in their definition
                finalHeaders.push(`${ex.label} - AMRAP Reps`);
            }
        });
        return finalHeaders;
    }

    function exportSessionsToExcel() {
        const sessions = getLogEntries();
        if (sessions.length === 0) {
            showToast("No data to export."); return;
        }

        const allHeaders = getAllExerciseHeadersForExcel();
    
        const dataForSheet = sessions.map(session => {
            const row = {
                'Timestamp': new Date(session.timestamp).toLocaleString(), 
                'Day ID': session.dayId
            };
            // Initialize all potential data columns to empty string
            allHeaders.slice(2).forEach(header => row[header] = ''); 

            if (session.lifts && Array.isArray(session.lifts)) {
                session.lifts.forEach(lift => {
                    // Find the exercise definition to check its isMainLift status for AMRAP column
                    const dayExercises = EXERCISES_BY_DAY[session.dayId] || [];
                    const exerciseDef = dayExercises.find(ex => ex.id === lift.exerciseId);

                    const weightHeader = `${lift.exerciseLabel} - Weight (kg)`;
                    if (allHeaders.includes(weightHeader) && typeof lift.weight === 'number') {
                         row[weightHeader] = lift.weight;
                    }

                    // Only attempt to populate AMRAP if the exercise is a main lift
                    if (exerciseDef?.isMainLift) {
                        const amrapHeader = `${lift.exerciseLabel} - AMRAP Reps`;
                        if (allHeaders.includes(amrapHeader) && typeof lift.amrapReps === 'number') {
                             row[amrapHeader] = lift.amrapReps;
                        }
                    }
                });
            }
            return row;
        });

        try {
            const worksheet = XLSX.utils.json_to_sheet(dataForSheet, { header: allHeaders, skipHeader: false }); 
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Strength Logs");

            const today = new Date();
            const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
            const fileName = `StrengthLogPro_Export_${dateStr}.xlsx`;

            XLSX.writeFile(workbook, fileName);
            showToast("Data exported to Excel!");
        } catch (err) {
            showToast("Error exporting data. See console.");
            console.error("Excel export error:", err);
        }
    }
    
    // Initial render if logs tab is active
    if (document.querySelector('.tab-button.active-tab-button[data-tab="logs-content"]')) {
        renderLogs();
    }
});
</script>
</body>
</html>
