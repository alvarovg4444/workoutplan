document.addEventListener('DOMContentLoaded', () => {
    const APP_STORAGE_KEY = 'simpleStrengthLog_v1';

    // Tab Navigation
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const defaultTabId = 'day1-content';

    function switchTab(targetTabId) {
        tabContents.forEach(content => {
            content.classList.remove('active-tab');
        });
        document.getElementById(targetTabId)?.classList.add('active-tab');

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

    // Initialize default tab
    switchTab(defaultTabId);

    // Form Handling
    const forms = document.querySelectorAll('.lift-form');
    forms.forEach(form => {
        const weightInput = form.querySelector('input[name="maxWeight"]');
        const submitButton = form.querySelector('button[type="submit"]');

        // Disable button if weight input is empty
        const toggleButtonState = () => {
            if (weightInput && submitButton) {
                submitButton.disabled = !weightInput.value.trim();
            }
        };

        if (weightInput) {
            weightInput.addEventListener('input', toggleButtonState);
            toggleButtonState(); // Initial check
        }

        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(form);
            const exerciseName = formData.get('exerciseName');
            const dayId = parseInt(formData.get('dayId'));
            const maxWeight = parseFloat(formData.get('maxWeight'));

            if (isNaN(maxWeight) || maxWeight <= 0) {
                showToast('Please enter a valid weight.');
                return;
            }

            const logEntry = {
                id: Date.now(), // Unique ID for potential future use (e.g., deleting)
                timestamp: Date.now(),
                dayId: dayId,
                exerciseName: exerciseName,
                maxWeight: maxWeight
            };

            saveLogEntry(logEntry);
            showToast(`${exerciseName} logged: ${maxWeight} kg! 💪`);
            form.reset();
            toggleButtonState(); // Re-disable button after reset

            // Optionally, switch to logs tab after logging
            // switchTab('logs-content');
        });
    });

    // LocalStorage Functions
    function getLogEntries() {
        const entriesJSON = localStorage.getItem(APP_STORAGE_KEY);
        return entriesJSON ? JSON.parse(entriesJSON) : [];
    }

    function saveLogEntry(entry) {
        const entries = getLogEntries();
        entries.push(entry);
        // Sort by newest first
        entries.sort((a, b) => b.timestamp - a.timestamp);
        localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(entries));
    }

    // Render Logs
    const logsListContainer = document.getElementById('logs-list');
    function renderLogs() {
        if (!logsListContainer) return;
        logsListContainer.innerHTML = ''; // Clear previous logs

        const entries = getLogEntries();

        if (entries.length === 0) {
            logsListContainer.innerHTML = '<p style="text-align:center; color:#777; padding:20px 0;">No lifts logged yet. Get to it!</p>';
            return;
        }

        entries.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'log-card';

            const date = new Date(entry.timestamp);
            const formattedDate = date.toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            card.innerHTML = `
                <div class="log-card-header">${formattedDate}</div>
                <div class="log-card-body">
                    <strong>${entry.exerciseName}</strong> (Day ${entry.dayId}): ${entry.maxWeight} kg
                </div>
            `;
            logsListContainer.appendChild(card);
        });
    }

    // Toast Notification
    const toastElement = document.getElementById('toast-message');
    let toastTimeout;

    function showToast(message) {
        if (!toastElement) return;
        clearTimeout(toastTimeout); // Clear any existing toast timeout

        toastElement.textContent = message;
        toastElement.classList.add('show');

        toastTimeout = setTimeout(() => {
            toastElement.classList.remove('show');
        }, 3000);
    }

    // Add Favicons and Manifest (Optional but good for PWA feel)
    // Create placeholder files: apple-touch-icon.png, favicon-32x32.png, favicon-16x16.png, site.webmanifest
    // Example site.webmanifest:
    /*
    {
        "name": "Max Weight Logger",
        "short_name": "MaxLog",
        "start_url": "index.html",
        "display": "standalone",
        "background_color": "#f4f7f6",
        "theme_color": "#4caf50",
        "icons": [
            { "src": "android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
            { "src": "android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" }
        ]
    }
    */
    // You'd need to generate these icon files.
});
