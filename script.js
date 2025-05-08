document.addEventListener('DOMContentLoaded', () => {
    const dayButtons = document.querySelectorAll('nav button[data-tab^="day"]');
    const historyButton = document.querySelector('nav button[data-tab="history"]');
    const workoutDays = document.querySelectorAll('.workout-day');
    const historySection = document.getElementById('history');
    const historyList = document.getElementById('history-list');
    const logButtons = document.querySelectorAll('.log-workout');
    const navButtons = document.querySelectorAll('nav button');
    const exportButton = document.getElementById('export-excel');


    let workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || [];

    // Function to show a specific tab
    function showTab(tabId) {
        workoutDays.forEach(day => {
            day.style.display = 'none';
        });
        historySection.style.display = 'none';

        navButtons.forEach(button => {
            button.classList.remove('active');
        });

        if (tabId === 'history') {
            historySection.style.display = 'block';
            historyButton.classList.add('active');
            renderHistory();
        } else {
            const targetDay = document.getElementById(tabId);
            if (targetDay) {
                targetDay.style.display = 'block';
                document.querySelector(`nav button[data-tab="${tabId}"]`).classList.add('active');
            }
        }
    }

    // Event listeners for navigation buttons
    dayButtons.forEach(button => {
        button.addEventListener('click', () => {
            showTab(button.dataset.tab);
        });
    });

    historyButton.addEventListener('click', () => {
        showTab('history');
    });

    // Function to log the workout data
    function logWorkout(day) {
        const now = new Date();
        const date = now.toLocaleDateString();
        const time = now.toLocaleTimeString();
        const workoutData = {
            day: day,
            date: date,
            time: time,
            exercises: {}
        };

        const daySectionId = day.toLowerCase().replace(/ /g, '');
        const inputs = document.querySelectorAll(`#${daySectionId} input[type="number"]`);

        inputs.forEach(input => {
            const exerciseName = input.dataset.exercise;
            const weight = input.value;
            if (exerciseName && weight) {
                workoutData.exercises[exerciseName] = weight + ' kg';
            }
        });

        workoutHistory.push(workoutData);
        localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
        renderHistory();
        alert(`Workout for ${day} logged!`);
    }

    // Event listeners for log workout buttons
    logButtons.forEach(button => {
        button.addEventListener('click', () => {
            logWorkout(button.dataset.day);
        });
    });

    // Function to render the workout history
    function renderHistory() {
        historyList.innerHTML = '';
        workoutHistory.forEach(log => {
            const listItem = document.createElement('li');
            let exerciseDetails = Object.entries(log.exercises)
                .map(([name, weight]) => `${name}: ${weight}`)
                .join(', ');
            listItem.textContent = `${log.day} - ${log.date} at ${log.time} - ${exerciseDetails}`;
            historyList.appendChild(listItem);
        });
    }

    // Initial display of the first day
    showTab('day1');

    // Function to export workout history to Excel
    function exportToExcel() {
        if (workoutHistory.length === 0) {
            alert('No workout history to export.');
            return;
        }

        // Prepare the data for Excel
        const data = workoutHistory.map(log => {
            const row = {
                Day: log.day,
                Date: log.date,
                Time: log.time,
            };
            for (const exercise in log.exercises) {
                row[exercise] = log.exercises[exercise];
            }
            return row;
        });

        // Create a new workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Workout History');

        // Generate the Excel file as a binary string
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        // Convert the binary string to a Blob
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);

        // Create a link and trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'workout_history.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Event listener for the export button
    if (exportButton) {
        exportButton.addEventListener('click', exportToExcel);
    }
});
