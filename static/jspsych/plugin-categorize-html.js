const info = {
  name: "categorize-html",
  version: _package.version,
  parameters: {
    stimulus: { /* HTML stimulus to show during trial */ },
    key_answer: { /* Correct response key (e.g., 'j') */ },
    choices: { /* List of keys participant can press */ },
    correct_text: { /* Feedback text if correct */ },
    incorrect_text: { /* Feedback text if incorrect */ },
    show_stim_with_feedback: { /* Whether to show stimulus during feedback */ },
    show_feedback_on_timeout: { /* Whether to show feedback when timeout occurs */ },
    timeout_message: { /* What to show if participant times out */ },
    trial_duration: { /* How long participant has to respond */ },
    feedback_duration: { /* How long feedback is shown */ },
  },
  data: {
    stimulus: {},      // HTML string shown
    response: {},      // Key pressed by participant
    rt: {},            // Reaction time
    correct: {}        // Whether response was correct
  }
};

class CategorizeHtmlPlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  static info = info;

  trial(display_element, trial) {
    // Show stimulus HTML
    display_element.innerHTML = '<div id="jspsych-categorize-html-stimulus" class="jspsych-categorize-html-stimulus">' + trial.stimulus + "</div>";

    // Hide stimulus after stimulus_duration (optional)
    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        display_element.querySelector("#jspsych-categorize-html-stimulus").style.visibility = "hidden";
      }, trial.stimulus_duration);
    }

    // Add prompt if provided
    if (trial.prompt !== null) {
      display_element.innerHTML += trial.prompt;
    }

    // Function to run after response (or timeout)
    const after_response = (info2) => {
      this.jsPsych.pluginAPI.cancelAllKeyboardResponses();  // Disable keyboard after response
      var correct = this.jsPsych.pluginAPI.compareKeys(trial.key_answer, info2.key);  // Evaluate correctness

      trial_data = {
        rt: info2.rt,
        correct,
        stimulus: trial.stimulus,
        response: info2.key
      };

      doFeedback(correct, info2.rt == null); // Show feedback
    };

    // Start listening for keypress
    this.jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: trial.choices,
      rt_method: "performance",
      persist: false,
      allow_held_key: false
    });

    // If no response within time, auto-finish
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        after_response({ key: null, rt: null });
      }, trial.trial_duration);
    }

    // End trial and store data
    const endTrial = () => {
      this.jsPsych.finishTrial(trial_data);
    };

    // Show feedback after response (correct/incorrect or timeout)
    const doFeedback = (correct, timeout) => {
      if (timeout && !trial.show_feedback_on_timeout) {
        display_element.innerHTML += trial.timeout_message;
      } else {
        if (trial.show_stim_with_feedback) {
          display_element.innerHTML = '<div id="jspsych-categorize-html-stimulus" class="jspsych-categorize-html-stimulus">' + trial.stimulus + "</div>";
        }

        var atext = correct ? trial.correct_text : trial.incorrect_text;
        display_element.innerHTML = atext.replace("%ANS%", trial.text_answer);
      }

      // If force correct key is enabled, wait for correct key before ending
      if (trial.force_correct_button_press && correct === false && (timeout && trial.show_feedback_on_timeout || !timeout)) {
        this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: () => endTrial(),
          valid_responses: [trial.key_answer],
          rt_method: "performance",
          persist: false,
          allow_held_key: false
        });
      } else {
        this.jsPsych.pluginAPI.setTimeout(endTrial, trial.feedback_duration);
      }
    };
  }

  // Simulation mode for testing
  simulate(trial, simulation_mode, simulation_options, load_callback) {
    if (simulation_mode == "data-only") {
      load_callback();
      this.simulate_data_only(trial, simulation_options);
    }
    if (simulation_mode == "visual") {
      this.simulate_visual(trial, simulation_options, load_callback);
    }
  }

  // Generate fake trial data
  create_simulation_data(trial, simulation_options) {
    const key = this.jsPsych.pluginAPI.getValidKey(trial.choices);
    const default_data = {
      stimulus: trial.stimulus,
      response: key,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      correct: key == trial.key_answer
    };
    return this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
  }

  // Finish simulated trial
  simulate_data_only(trial, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);
    this.jsPsych.finishTrial(data);
  }

  // Run simulated visual version of trial
  simulate_visual(trial, simulation_options, load_callback) {
    const data = this.create_simulation_data(trial, simulation_options);
    const display_element = this.jsPsych.getDisplayElement();
    this.trial(display_element, trial);
    load_callback();

    if (data.rt !== null) {
      this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
    }
    if (trial.force_correct_button_press && !data.correct) {
      this.jsPsych.pluginAPI.pressKey(trial.key_answer, data.rt + trial.feedback_duration / 2);
    }
  }
}
