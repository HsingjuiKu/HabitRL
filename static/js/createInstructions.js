/* --------------------------------------------------------------------------------
 * createInstructions1 builds the first set of instruction slides and pushes them
 * to the jsPsych timeline. Each slide uses the html-keyboard-response plugin,
 * displays some HTML, and waits for the participant to press the space bar.
 * -------------------------------------------------------------------------------- */
const createInstructions1 = function() {
  // Slide 1: Welcome message and environment setup
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,      // plugin type: display HTML, wait for keyboard
    stimulus: `
      <div class='center'>
        <p>Hello! Before beginning the task, please maximize this window and 
        turn off all notifications on your computer.<br><br>
        This game will require you to focus! Please make sure you're in a quiet environment.
        </p>
      </div>
    ` + CONTINUE,                          // CONTINUE is a constant string like "<p>Press space to continue</p>"
    choices: [' ']                         // only space bar advances
  });

  // Slide 2: Explain response keys
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class='center'>
        <p>In this experiment, you will see a series of images on the screen.<br><br>
        Please respond to each image by pressing one of the three keys on the keyboard:
        J, K, or L, with your dominant hand.
        </p>
      </div>
    ` + CONTINUE,
    choices: [' ']
  });

  // Slide 3: Describe task goal and speed/accuracy emphasis
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class='center'>
        <p>For each image, there is a button that gives you points.<br><br>
        Your goal is to figure out which button makes you win for each image.<br><br>
        You will have a couple seconds to respond.<br><br>
        Please respond to every image as quickly and accurately as possible.<br><br>
        If you do not respond, the trial will be counted as a loss.
        </p>
      </div>
    ` + CONTINUE,
    choices: [' ']
  });

  // Slide 4: Point system explanation
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class='center'>
        <p>If you select the correct button, you will gain <span style="color:green;">+1</span> point.<br><br>
        If you select the incorrect key or do not respond, you will earn <span style="color:red;">0</span> points.
        </p>
      </div>
    ` + CONTINUE,
    choices: [' ']
  });

  // Slide 5: Transition to practice trials
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class='center'>
        <p>Push the space bar to try this task out with two images.<br><br>
        Remember to respond with the J, K, or L keys.
        </p>
      </div>
    ` + CONTINUE,
    choices: [' ']
  });
};

/* --------------------------------------------------------------------------------
 * createInstructions2 builds the second instruction slides:
 * it saves the data from Practice Block 1, then previews the upcoming change
 * in the task (reversals).
 * -------------------------------------------------------------------------------- */
const createInstructions2 = function() {
  // Slide 1: Save Practice Block 1 data, then encourage participant
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    on_start: trial => {
      // Save data from the first practice block
      let toSave = jsPsych.data.get().filter({ block: 1 });
      let blockFileName = `${file_name}_block_1`;
      save_data_csv(blockFileName, toSave);
    },
    stimulus: `
      <div class='center'>
        <p>Great job!<br><br>
        Now the task is going to get a little harder.
        </p>
      </div>
    ` + CONTINUE,
    choices: [' ']
  });

  // Slide 2: Explain that correct responses will now change over time
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class='center'>
        <p>Before, the correct action for each image stayed the same.<br><br>
        Now, the correct action for an image can change after a while.<br><br>
        When that happens, you'll need to figure out what the new correct action is!
        </p>
      </div>
    ` + CONTINUE,
    choices: [' ']
  });

  // Slide 3: Transition to single-image practice with reversals
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class='center'>
        <p>Push the space bar to try this task out with one image.<br><br>
        Remember to respond with the J, K, or L keys.
        </p>
      </div>
    ` + CONTINUE,
    choices: [' ']
  });
};

/* --------------------------------------------------------------------------------
 * createInstructions3 builds the final instruction slides:
 * it saves Practice Block 2 data, then gives overview of full experiment
 * and key rules to remember.
 * -------------------------------------------------------------------------------- */
const createInstructions3 = function() {
  // Slide 1: Save Practice Block 2 data, then congratulate
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    on_start: trial => {
      // Save data from the second practice block
      let toSave = jsPsych.data.get().filter({ block: 2 });
      let blockFileName = `${file_name}_block_2`;
      save_data_csv(blockFileName, toSave);
    },
    stimulus: `
      <div class='center'>
        <p>Great job! You have completed the practice section.<br><br>
        You will now begin the task.
        </p>
      </div>
    ` + CONTINUE,
    choices: [' ']
  });

  // Slide 2: Describe the structure of the main experiment
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class='center'>
        <p>There are 21 blocks.<br><br>
        At the beginning of each block, you will be shown the set of images for that block.<br><br>
        Some blocks will have more images than others, but your goal is always the same.<br><br>
        You can take a short break between each block.
        </p>
      </div>
    ` + CONTINUE,
    choices: [' ']
  });

  // Slide 3: Reinforce the three key rules participants must remember
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class='center'>
        <p>Remember the following important rules:<br><br>
        1. At any given time, there is ONLY ONE correct response for each image.<br><br>
        2. Within each block, the correct response for each image WILL CHANGE.
           After you gain points for an image multiple times, you will have to find the new key to press to win again.<br><br>
        3. One response button MAY be correct for multiple images, or not be correct for any image.
        </p>
      </div>
    ` + CONTINUE,
    choices: [' ']
  });
};
