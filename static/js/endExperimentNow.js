const endExperimentNow = function endExperimentNow(message) {
  const end_trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<p>${message}</p>`,
    choices: "NO_KEYS"
  };
  jsPsych.finishTrial();
  jsPsych.abortExperiment(message);
}
