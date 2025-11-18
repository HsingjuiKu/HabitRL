let rows_saved = 3  // init at 3 to avoid issue caused by different variables (column names) in the first three events

const save_data_csv = function() {
    // Get data
    const data = jsPsych.data.get();
    const n_rows = data.count();
    const newData = data.last(n_rows - rows_saved);
    if (rows_saved > 3) { // remove header
        var lines = newData.csv().split('\n');
        lines.shift();
        newDataString = lines.join('\n');
    } else {
        newDataString = newData.csv();
    }
    
    // Backend
    jQuery.ajax({
        type: 'post',
        cache: false,
        url: "https://experiments-ccn.berkeley.edu/HabitRL_probabilistic/HabitRL/save_data.php",
        data: {
            data_dir: "data",
            file_name: window.fileName,
            exp_data: newDataString
        }
    });

    // Keep track 
    rows_saved = data.count()
}