const info = {
  name: "html-keyboard-response",
  version: _package.version,
  parameters: {
    stimulus: { /* HTML content to be shown during the trial */ },
    choices: { /* List of allowed keys for response (or "NO_KEYS") */ },
    prompt: { /* Optional text below the stimulus */ },
    stimulus_duration: { /* Duration before stimulus is hidden (ms) */ },
    trial_duration: { /* Total trial duration (ms), after which it auto-ends */ },
    response_ends_trial: { /* Whether pressing a key ends the trial immediately */ }
  },
  data: {
    response: {},    // Key that was pressed
    rt: {},          // Reaction time in ms
    stimulus: {}     // Stimulus that was shown
  }
};

class HtmlKeyboardResponsePlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  static info = info;

  trial(display_element, trial) {
    // Create and display the stimulus HTML
    var new_html = '<div id="jspsych-html-keyboard-response-stimulus">' + trial.stimulus + "</div>";

    // Add prompt text if provided
    if (trial.prompt !== null) {
      new_html += trial.prompt;
    }

    // Render content in the DOM
    display_element.innerHTML = new_html;

    // Object to store response
    var response = {
      rt: null,
      key: null
    };

    // Function to end the trial and save data
    const end_trial = () => {
      if (typeof keyboardListener !== "undefined") {
        this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      var trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        response: response.key
      };

      this.jsPsych.finishTrial(trial_data);
    };

    // Function to handle keypress
    var after_response = (info2) => {
      display_element.querySelector("#jspsych-html-keyboard-response-stimulus").className += " responded";

      // Record only the first key press
      if (response.key == null) {
        response = info2;
      }

      // If trial ends upon response, finish it now
      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // Listen for keypresses unless choices is set to NO_KEYS
    if (trial.choices != "NO_KEYS") {
      var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: "performance",
        persist: false,
        allow_held_key: false
      });
    }

    // Automatically hide stimulus after stimulus_duration
    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        display_element.querySelector("#jspsych-html-keyboard-response-stimulus").style.visibility = "hidden";
      }, trial.stimulus_duration);
    }

    // Automatically end trial after trial_duration
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
    }
  }

  // ----- Simulation Support -----

  simulate(trial, simulation_mode, simulation_options, load_callback) {
    if (simulation_mode == "data-only") {
      load_callback();
      this.simulate_data_only(trial, simulation_options);
    }
    if (simulation_mode == "visual") {
      this.simulate_visual(trial, simulation_options, load_callback);
    }
  }

  // Create simulated response data
  create_simulation_data(trial, simulation_options) {
    const default_data = {
      stimulus: trial.stimulus,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      response: this.jsPsych.pluginAPI.getValidKey(trial.choices)
    };
    return this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
  }

  simulate_data_only(trial, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);
    this.jsPsych.finishTrial(data);
  }

  simulate_visual(trial, simulation_options, load_callback) {
    const data = this.create_simulation_data(trial, simulation_options);
    const display_element = this.jsPsych.getDisplayElement();
    this.trial(display_element, trial);
    load_callback();
    if (data.rt !== null) {
      this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
    }
  }
}
