const LOCAL_STORAGE_KEY = 'v1_sessions';

function getSessions() {
    const sessionsJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
    return sessionsJSON ? JSON.parse(sessionsJSON) : [];
}

function saveSession(sessionData) {
    const sessions = getSessions();
    sessions.push(sessionData);
    // Sort by newest first before saving
    sessions.sort((a, b) => b.timestamp - a.timestamp);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
}

function exportSessionsToExcel() {
    const sessions = getSessions();
    if (sessions.length === 0) {
        alert("No sessions to export.");
        return;
    }

    // Data massaging for excel - ensure all columns exist for all rows
    const dataForSheet = sessions.map(session => {
        const date = new Date(session.timestamp);
        const formattedTimestamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

        // Define all possible columns in order
        const row = {
            timestamp: formattedTimestamp,
            dayId: session.dayId,
            bodyweight: session.bodyweight !== undefined ? session.bodyweight : '',
            mainWeight: session.mainWeight !== undefined ? session.mainWeight : '',
            set1: session.set1 !== undefined ? session.set1 : '',
            set2: session.set2 !== undefined ? session.set2 : '',
            set3: session.set3 !== undefined ? session.set3 : '',
            set4: session.set4 !== undefined ? session.set4 : '',
            set5: session.set5 !== undefined ? session.set5 : '',
            amrapReps: session.amrapCheckbox && session.amrapReps !== undefined ? session.amrapReps : '',
            rpe: session.amrapCheckbox && session.rpe !== undefined ? session.rpe : '',
            notes: session.notes || ''
        };

        // Add accessory work if present (this can make the sheet wide or require more complex handling)
        // For simplicity, let's add specific known accessories per day.
        // A more robust solution would iterate over all keys starting with 'accessory_'
        // but that depends on consistent naming.

        // Day 1 Accessories
        if (session.dayId === 1) {
            row.accessory_romanian_dl_weight = session.accessory_romanian_dl_weight || '';
            row.accessory_romanian_dl_reps = session.accessory_romanian_dl_reps || '';
            row.accessory_split_squat_weight = session.accessory_split_squat_weight || '';
            row.accessory_split_squat_reps = session.accessory_split_squat_reps || '';
            row.accessory_incline_db_press_weight = session.accessory_incline_db_press_weight || '';
            row.accessory_incline_db_press_reps = session.accessory_incline_db_press_reps || '';
        }
        // Day 2 Accessories
        if (session.dayId === 2) {
            row.accessory_overhead_press_weight = session.accessory_overhead_press_weight || '';
            row.accessory_overhead_press_reps = session.accessory_overhead_press_reps || '';
            row.accessory_pendlay_row_weight = session.accessory_pendlay_row_weight || '';
            row.accessory_pendlay_row_reps = session.accessory_pendlay_row_reps || '';
            row.accessory_weighted_pullups_weight = session.accessory_weighted_pullups_weight || '';
            row.accessory_weighted_pullups_reps = session.accessory_weighted_pullups_reps || '';
            row.accessory_rear_delt_fly_weight = session.accessory_rear_delt_fly_weight || '';
            row.accessory_rear_delt_fly_reps = session.accessory_rear_delt_fly_reps || '';
        }
        // Day 3 Accessories
        if (session.dayId === 3) {
            row.accessory_front_squat_weight = session.accessory_front_squat_weight || '';
            row.accessory_front_squat_reps = session.accessory_front_squat_reps || '';
            row.accessory_close_grip_bench_dips_weight = session.accessory_close_grip_bench_dips_weight || '';
            row.accessory_close_grip_bench_dips_reps = session.accessory_close_grip_bench_dips_reps || '';
            row.accessory_leg_press_weight = session.accessory_leg_press_weight || '';
            row.accessory_leg_press_reps = session.accessory_leg_press_reps || '';
            row.accessory_ez_bar_curl_weight = session.accessory_ez_bar_curl_weight || '';
            row.accessory_ez_bar_curl_reps = session.accessory_ez_bar_curl_reps || '';
            row.accessory_triceps_pushdown_weight = session.accessory_triceps_pushdown_weight || '';
            row.accessory_triceps_pushdown_reps = session.accessory_triceps_pushdown_reps || '';
        }
        return row;
    });

    // Create a new workbook and a worksheet
    const ws = XLSX.utils.json_to_sheet(dataForSheet, {
        header: [ // Explicitly define header order and names
            "timestamp", "dayId", "bodyweight", "mainWeight",
            "set1", "set2", "set3", "set4", "set5",
            "amrapReps", "rpe", "notes",
            // Day 1
            "accessory_romanian_dl_weight", "accessory_romanian_dl_reps",
            "accessory_split_squat_weight", "accessory_split_squat_reps",
            "accessory_incline_db_press_weight", "accessory_incline_db_press_reps",
            // Day 2
            "accessory_overhead_press_weight", "accessory_overhead_press_reps",
            "accessory_pendlay_row_weight", "accessory_pendlay_row_reps",
            "accessory_weighted_pullups_weight", "accessory_weighted_pullups_reps",
            "accessory_rear_delt_fly_weight", "accessory_rear_delt_fly_reps",
            // Day 3
            "accessory_front_squat_weight", "accessory_front_squat_reps",
            "accessory_close_grip_bench_dips_weight", "accessory_close_grip_bench_dips_reps",
            "accessory_leg_press_weight", "accessory_leg_press_reps",
            "accessory_ez_bar_curl_weight", "accessory_ez_bar_curl_reps",
            "accessory_triceps_pushdown_weight", "accessory_triceps_pushdown_reps"
        ]
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sessions");

    // Generate a unique filename
    const today = new Date();
    const fileName = `Strength_Log_${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}.xlsx`;

    // Trigger the download
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), fileName);
}
