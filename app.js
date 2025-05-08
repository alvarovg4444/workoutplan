document.addEventListener('DOMContentLoaded', () => {
    constLOCAL_STORAGE_KEY = 'v1_sessions';

    // Tab Navigation
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const defaultTab = 'day1-content';

    function switchTab(targetTabId) {
        tabContents.forEach(content => {
            content.classList.remove('active-tab');
            if (content.id === targetTabId) {
                content.classList.add('active-tab');
            }
        });
        tabButtons.forEach(button => {
            button.classList.remove('active-tab-button');
            if (button.dataset.tab === targetTabId) {
                button.classList.add('active-tab-button');
            }
        });

        if (targetTabId === 'logs-content') {
            renderLogs();
        }
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.tab);
        });
    });

    // Default Tab
    switchTab(defaultTab);

    // AMRAP Checkbox Logic & RPE Slider Output
    function setupWorkoutDay(dayId) {
        const amrapCheckbox = document.getElementById(`day${dayId}-amrap-checkbox`);
        const amrapFields = document.getElementById(`day${dayId}-amrap-fields`);
        const rpeSlider = document.getElementById(`day${dayId}-rpe`);
        const rpeOutput = document.getElementById(`day${dayId}-rpe-output`);
        const mainLiftWeightInput = document.getElementById(`day${dayId}-main-lift-weight`);
        const logButton = document.getElementById(`log-day${dayId}`);

        if (amrapCheckbox) {
            amrapCheckbox.addEventListener('change', () => {
                amrapFields.classList.toggle('hidden', !amrapCheckbox.checked);
                amrapFields.style.display = amrapCheckbox.checked ? 'flex' : 'none';
            });
            // Initial state
            amrapFields.style.display = amrapCheckbox.checked ? 'flex' : 'none';
        }

        if (rpeSlider && rpeOutput) {
            rpeOutput.textContent = rpeSlider.value;
            rpeSlider.addEventListener('input', () => {
                rpeOutput.textContent = rpeSlider.value;
            });
        }

        // Disable Log button if main lift weight is empty
        if (mainLiftWeightInput && logButton) {
            const toggleLogButtonState = () => {
                logButton.disabled = !mainLiftWeightInput.value.trim();
            };
            toggleLogButtonState(); // Initial check
            mainLiftWeightInput.addEventListener('input', toggleLogButtonState);
        }

        // Form Submission
        const form = document.getElementById(`day${dayId}-form`);
        if (form) {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const formData = new FormData(form);
                const sessionData = {
                    dayId: parseInt(dayId),
                    timestamp: Date.now(),
                };

                // Collect all form data
                for (let [key, value] of formData.entries()) {
                    // Convert number fields appropriately
                    const inputElement = form.elements[key];
                    if (inputElement && inputElement.type === 'number' && value !== '') {
                        sessionData[key] = parseFloat(value);
                    } else if (inputElement && inputElement.type === 'checkbox') {
                        sessionData[key] = inputElement.checked;
                    }
                    else if (value !== '') { // For text, textarea
                        sessionData[key] = value;
                    }
                }

                // If AMRAP not checked, remove related fields from data
                if (!sessionData.amrapCheckbox) {
                    delete sessionData.amrapReps;
                    delete sessionData.rpe;
                }
                // delete sessionData.amrapCheckbox; // Don't need to store this boolean itself

                saveSession(sessionData);
                showToast(`Day ${dayId} session saved 🎉`);
                form.reset(); // Reset form after submission

                // Reset AMRAP fields visibility and RPE output
                if (amrapCheckbox) amrapCheckbox.checked = true;
                if (amrapFields) amrapFields.style.display = 'flex';
                if (rpeSlider && rpeOutput) {
                     rpeSlider.value = 8; // Reset RPE slider to default
                     rpeOutput.textContent = rpeSlider.value;
                }
                // Re-disable log button
                if (logButton) logButton.disabled = true;

                // Prefill reps based on common schemes (example: 3 for day 1/2, 2 for day 3)
                const repInputs = form.querySelectorAll('input[name^="set"]');
                let repValue = 3;
                if (dayId === '3') repValue = 2; // Example for Day 3 main lift
                else if (dayId === '2') { // Example for Day 2 main lift
                  repInputs.forEach((input, index) => {
                    input.value = (index < 3) ? 3 : 2; // First 3 sets 3 reps, next 2 sets 2 reps
                  });
                  return; // exit early
                }
                repInputs.forEach(input => input.value = repValue);

            });
        }
    }

    setupWorkoutDay('1');
    setupWorkoutDay('2');
    setupWorkoutDay('3');

    // Toast Notification
    const toastElement = document.getElementById('toast');
    function showToast(message) {
        toastElement.textContent = message;
        toastElement.classList.add('show');
        setTimeout(() => {
            toastElement.classList.remove('show');
        }, 3000);
    }

    // Logs Tab Functionality
    const logsList = document.getElementById('logs-list');
    const filterChipsContainer = document.querySelector('.filter-chips');
    let currentFilter = 'all';

    function renderLogs() {
        if (!logsList) return;
        logsList.innerHTML = ''; // Clear previous logs
        const sessions = getSessions();

        const filteredSessions = sessions.filter(session => {
            if (currentFilter === 'all') return true;
            return session.dayId === parseInt(currentFilter);
        });

        if (filteredSessions.length === 0) {
            logsList.innerHTML = '<p>No sessions logged yet for this filter.</p>';
            return;
        }

        filteredSessions.forEach(session => {
            const card = document.createElement('div');
            card.className = 'log-card';

            const date = new Date(session.timestamp);
            const formattedDate = date.toLocaleDateString('en-US', {
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            let cardBodyHTML = `<p><strong>Main Lift:</strong> ${session.mainWeight || 'N/A'} kg</p>`;
            if (session.amrapCheckbox && session.amrapReps !== undefined) {
                cardBodyHTML += `<p><strong>AMRAP:</strong> ${session.amrapReps} reps at RPE ${session.rpe || 'N/A'}</p>`;
            } else if (session.amrapCheckbox && session.amrapReps === undefined) {
                 cardBodyHTML += `<p><strong>AMRAP:</strong> (Not recorded)</p>`;
            }


            if (session.notes) {
                cardBodyHTML += `<p class="notes"><strong>Notes:</strong> ${session.notes}</p>`;
            }

            card.innerHTML = `
                <div class="log-card-header">${formattedDate} &middot; Day ${session.dayId}</div>
                <div class="log-card-body">
                    ${cardBodyHTML}
                </div>
            `;
            // Accordion functionality (optional - simple for now)
            // card.addEventListener('click', () => card.classList.toggle('open'));
            logsList.appendChild(card);
        });
    }

    if (filterChipsContainer) {
        filterChipsContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('chip')) {
                document.querySelectorAll('.filter-chips .chip').forEach(chip => chip.classList.remove('active'));
                event.target.classList.add('active');
                currentFilter = event.target.dataset.filter;
                renderLogs();
            }
        });
    }

    // Export to Excel
    const exportButton = document.getElementById('export-excel');
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            exportSessionsToExcel();
            showToast('Exporting to Excel...');
        });
    }

    // Initialize logs if on logs tab initially (though default is Day 1)
    if (document.querySelector('.tab-button.active-tab-button[data-tab="logs-content"]')) {
        renderLogs();
    }
});
