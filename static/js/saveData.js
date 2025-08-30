let rows_saved = 3  // init at 3 to avoid issue caused by different variables in the first three events

const save_data_csv = function() {
    // Get data
    let data = jsPsych.data.get();
    const n_rows = data.count();
    let newData = data.last(n_rows - rows_saved);
    
    // Backend
    jQuery.ajax({
        type: 'post',
        cache: false,
        url: "https://experiments-ccn.berkeley.edu/HabitRL/save_data.php",
        data: {
            data_dir: "data",
            file_name: window.fileName,
            exp_data: newData.csv()
        }
    });

    // Keep track 
    rows_saved = data.count()
}