/**
 * endExperimentNow.js
 * 
 * Description:
 * This helper function is used to **immediately terminate the experiment**.
 * It is called when the participant meets predefined abort conditions (e.g., leaving the task window too many times).
 * 
 * Usage:
 * Call `endExperimentNow("Your custom message")` to display a message and end the experiment cleanly.
 * 
 * Dependencies:
 * - jsPsych v8+
 */

// Define the function to terminate the experiment early
const endExperimentNow = function endExperimentNow(message) {
  // Create a final trial displaying the custom message (not pushed to timeline here)
  const end_trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<p>${message}</p>`,
    choices: "NO_KEYS"
  };

  // End the current trial (if any)
  jsPsych.finishTrial();

  // Abort the experiment and log the message
  jsPsych.abortExperiment(message);
};
