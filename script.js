document.addEventListener('DOMContentLoaded', () => {
    const dayButtons = document.querySelectorAll('nav button[data-tab^="day"]');
    const historyButton = document.querySelector('nav button[data-tab="history"]');
    const workoutDays = document.querySelectorAll('.workout-day');
    const historySection = document.getElementById('history');
    const historyList = document.getElementById('history-list');
    const logButtons = document.querySelectorAll('.log-workout');

    let workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || [];

    // Function to show a specific tab
    function showTab(tabId) {
        workoutDays.forEach(day => {
            day.style.display = 'none';
        });
        historySection.style.display = 'none';

        if (tabId === 'history') {
            historySection.style.display = 'block';
            renderHistory();
        } else {
            const targetDay = document.getElementById(tabId);
            if (targetDay) {
                targetDay.style.display = 'block';
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

        const daySectionId = day.toLowerCase().replace(/ /g, ''); // Get the day's section ID
        const inputs = document.querySelectorAll(`#${daySectionId} input[type="number"]`); // Select inputs within the day's section

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
});
