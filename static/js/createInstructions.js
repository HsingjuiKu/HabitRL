/* createInstruction builds the sequence of your instructions. each instruction slide
is an object to be pushed to the instrTimeline. You'll mainly have to replace the value for
the stimulus property. The type will be "html-button-response" if you're using a button
or "html-keyboard-response" for keys. Check jsPsych to see more configurations. */

const CONTINUE = '<p class="continue">[Press SPACE to continue]</p>'; // instruction page footer

const createInstructions1 = function() {
  let instrTimeline = []

  // Fullscreen entry prompt with instructions
  instrTimeline.push({
    type: jsPsychFullscreen,
    fullscreen_mode: true,
    message: '<p style="text-align: left; line-height: 1.6em">'
      + 'Welcome to this experiment! Before we begin, ensure the following:<br/>'
      + '(1) Use a computer and a modern browser (Chrome, Edge, Firefox, or Safari)<br/>'
      + '(2) Close or minimize other programs and turn off all notifications<br/>'
      + '(3) Silence your phone and minimize background noise<br/>'
      + '(4) Do not exit full screen during the experiment<br/>'
      + 'If you agree to participate and understand the requirements, click to start:' + '</p>',
    button_label: 'Click here to start in fullscreen',
    delay_after: 100,
    on_finish: function () {
      const bodyNode = document.getElementsByTagName("body");
      for (let i = 0; i < bodyNode.length; i++) {
        bodyNode[i].style.cursor = "none";
      }
    }
  })
  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<p style="text-align: center; line-height: 1.6em">'
    + '<h3>Instruction 1/5</h3>'
    + 'In this experiment, you will see a series of images on the screen.<br/>'
    + 'You can respond to each image by pressing one of the following buttons on the keyboard:<br/><br/>'
    + `<div style="display: flex; justify-content: center; gap: 40px;">`
    + showAvailableKeys(['f', 'g', 'h', 'j'])
    + '</p></div>' + CONTINUE,
    choices: [" "],
  });
  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<p style="text-align: center; line-height: 1.6em">'
    + '<h3>Instruction 2/5</h3>'
    + 'Pressing a button in response to an image can give you <span style="color:red;">0</span> or <span style="color:green;">+1</span> points<br/>'
    + 'The probability of receiving <span style="color:red;">0</span> or <span style="color:green;">+1</span> points differs for each button and each image.<br/>'
    + 'Your goal is to collect as many points as possible.<br/>'
    + '</p></div>' + CONTINUE,
    choices: [" "],
  });
  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<p style="text-align: center; line-height: 1.6em">'
    + '<h3>Instruction 3/5</h3>'
    + 'Each trial will first show a fixation cross. Please focus on this.<br/>'
    + 'When the image is shown, you have two seconds to respond.<br/>'
    + '</p></div>' + CONTINUE,
    choices: [" "],
  });
  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<p style="text-align: center; line-height: 1.6em">'
    + '<h3>Instruction 4/5</h3>'
    + 'Not all four actions might be available to you at a given time.<br/>'
    + 'This will be indicated to you.'
    + '</p></div>' + CONTINUE,
    choices: [" "],
  });
  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<p style="text-align: center; line-height: 1.6em">'
    + '<h3>Instruction 5/5</h3>'
    + 'There will be 12 images, each of which will be presented repeatedly.<br/>'
    + 'To respond, please use your dominant with one finger on each button at all times.<br/>'
    + 'You will now start the main experiment.<br/>'
    + '</p></div>' + CONTINUE,
    choices: [" "],
  });
  return instrTimeline
};

const createBlockInstructions1 = function(condition, blockCount) {
  let instrTimeline = []

  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<h3>Image ${blockCount}</h3>`
    + 'For the next trials, only single actions will be available.'
    + '</p></div>' + CONTINUE,
    choices: [" "],
  });
  
  return instrTimeline
};

const createBlockInstructions2 = function(condition, blockCount, allowedKeys) {
  let instrTimeline = []
  let htmlString = `
    <div style="text-align: center;">
      <h3>Image ${blockCount}</h3>
      The following actions will be available:<br/><br/>
      <div style="display: flex; justify-content: center; gap: 40px;">`;

  htmlString += showAvailableKeys(allowedKeys)

  htmlString += '</p></div>' + CONTINUE;

  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: htmlString,
    choices: [" "],
  });
  
  return instrTimeline
};

const createTestInstructions = function() {
  instrTimeline = [{
    type: jsPsychHtmlKeyboardResponse,
	  stimulus: '<h3>Final Phase</h3>'
    + 'In this last part of the experiment, you will see the images again, in mixed order.<br/>'
    + 'There will be no feedback on whether you receive a point or not.<br/>'
    + 'And you have all four actions available at all times.<br/>'
    + 'Please respond as quickly and accurately as possible.'
    + '</p></div>' + CONTINUE,
	  choices: [" "]
  }]
  return instrTimeline
}

const createEndInstructions = function() {
  let instrTimeline = []
  // Final trial showing thank-you message and saving data
  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<h3>Experiment Complete</h3><p>Thank you for your participation!</p><p>Press SPACE to finish</p>',
    choices: [" "],
    on_finish: () => {
      const id = jsPsych.data.get().values()[1].id || 'unknown';
      const d = new Date(), ymd = d.toISOString().slice(0,10).replace(/-/g, '');
      jsPsych.data.get().localSave('csv', `${id}-${ymd}.csv`);
    },
    trial_duration: 5000
  });

  // Exit fullscreen and show mouse cursor again
  instrTimeline.push({
    type: jsPsychFullscreen,
    fullscreen_mode: false,
    message: '<p style="text-align: left; line-height: 1.6em">You can now close this window.',
    on_finish: function () {
      var bodyNode = document.getElementsByTagName("body");
      for (let i = 0; i < bodyNode.length; i++) {
        bodyNode[i].style.cursor = "default";
      }
    }
  })

  return instrTimeline
};