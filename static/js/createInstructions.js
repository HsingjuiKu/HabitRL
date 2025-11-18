/* createInstruction builds the sequence of your instructions. each instruction slide
is an object to be pushed to the instrTimeline. You'll mainly have to replace the value for
the stimulus property. The type will be "html-button-response" if you're using a button
or "html-keyboard-response" for keys. Check jsPsych to see more configurations. */

const CONTINUE = '<p class="continue" style="text-align: center;"><br/>[Press SPACE to continue or X to go back]</p>'; // instruction page footer
const CONTINUEEXP = '<p class="continue" style="text-align: center;"><br/>[Press SPACE to continue]</p>'; // instruction page footer

const instrPage1 = '<h3>Instruction 1/7</h3>'
    + '<p>'
    + 'In this experiment, you will see a series of images on the screen.<br/><br/>'
    + 'You can respond to each image by pressing one of the following keys on the keyboard:<br/>'
    + '</p>'
    + `<div style="display: flex; justify-content: center; gap: 40px; margin: 20px 0;">`
    + showAvailableKeys(['f', 'g', 'h', 'j'])
    + '</div>' + CONTINUEEXP;

const instrPage2 = '<h3>Instruction 2/7</h3>'
    + '<p>'
    + 'Pressing a key in response to an image can give you 0 or 1 point. '
    + 'How many points your receive <b>depends on each key and each image</b>: '
    + 'some will give you points more often, others less often. <b>Try to figure it out!</b><br/><br/>'
    + 'Your goal is to <b>collect as many points as possible!</b> '
    + 'The more points you collect, <b>the shorter the duration</b> of the experiment.<br/>'
    + '</p></div>' + CONTINUE;

const instrPage3 = '<h3>Instruction 3/7</h3>'
    + '<p>'
    + 'When the image is shown, you have <b>two seconds</b> to respond - make sure to answer in that time, or the trial is <b>lost!</b><br/><br/>'
    + 'You will see a + sign between each trial. Keep your eyes on it to be ready to focus on the next image!<br/>'
    + '</p></div>' + CONTINUE;

const instrPage4 = '<h3>Instruction 4/7</h3>'
    + '<p>'
    + 'For each image you will learn all three keys on the keyboard.<br/><br/>'
    + 'However, you will <b>not always be allowed to press all three keys at all times</b>. You will see which are available under the image.<br/><br/>'
    + 'For example, in this trial, only F and H are available - make sure you choose between <b>those two only</b>.<br/>'
    + `<div style="display: flex; justify-content: center; gap: 40px; margin: 20px 0;">`
    + showAvailableKeys(['f', 'h'])
    + '</p></div>' + CONTINUE;

const instrPage5 = '<h3>Instruction 5/7</h3>'
    + '<p>'
    + 'There will be <b>eight blocks</b>, each with <b>three images</b> to learn about. You can take short breaks between each block.<br/><br/>'
    + 'The keys that will give more or less points will <b>never be the same for the three images</b> in a block. '
    + 'So, for example, if F gives the most points for one image (and G the second most etc.), F will not give the most points for the other images (and G not the second most etc.).'
    + '</p></div>' + CONTINUE;

const instrPage6 = '<h3>Instruction 6/7</h3>'
    + '<p>'
    + 'To make sure you are paying attention, we will also show you occasionally an instruction to <b>press a specific key</b>, like shown below.<br/><br/>'
    + 'Make sure you <b>press the correct key!</b></br>.' 
    + `<div style="text-align: center;">`
    + `<img src="static/images/f.jpg" style="width: 300px; height: 300px; margin-bottom: 10px;">`
    + `</div>`
    + '</p></div>' + CONTINUE;

const instrPage7 = '<h3 style="font-size: 2em; ">Instruction 7/7</h3>'
    + '<p>'
    + 'You will now start the main experiment.<br/><br/>'
    + 'Before you start, please <b>position your dominant hand with one finger on each key</b>, and keep it there for the block duration!<br/><br/>'
    + '</p></div>' + '<p class="continue" style="text-align: center;"><br/>[Press SPACE to <b>start</b> the experiment or X to go back]</p>';

const createFullScreenInstructions = function() {
  let instrTimeline = []
  instrTimeline.push({
    type: jsPsychFullscreen,
    fullscreen_mode: true,
    message: '<p>'
      + 'Welcome to this experiment! Before we begin, ensure the following:<br/>'
      + '(1) Use a computer and a modern browser (Chrome, Edge, Firefox, or Safari)<br/>'
      + '(2) Close or minimize other programs and turn off all notifications<br/>'
      + '(3) Silence your phone and minimize background noise<br/>'
      + '(4) Do not exit full screen during the experiment<br/>'
      + 'If you agree to participate and understand the requirements, click to start:' 
      + '</p>',
    button_label: 'Click here to start in fullscreen',
    delay_after: 100,
    on_finish: function () {
      const bodyNode = document.getElementsByTagName("body");
      for (let i = 0; i < bodyNode.length; i++) {
        bodyNode[i].style.cursor = "none";
      }
    }
  });
  return instrTimeline
}

const createInstructions = function() {
  let instrTimeline = []
  instrTimeline.push({
    type: jsPsychInstructions,
    pages: [
        instrPage1,
        instrPage2,
        instrPage3,
        instrPage4,
        instrPage5,
        instrPage6,
        instrPage7,
    ],
    key_forward: ' ',
    key_backward: 'x',
    show_clickable_nav: false,
  });
  return instrTimeline
}

const createBlockInstructions1 = function(blockIdx, nBlocks) {
  instrTimeline = [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<h3 style="font-size: 2em; ">Block ${blockIdx + 1}/${nBlocks}</h3>`
      + '<p>'
      + 'Before continuing with the next set of images, please take a short break.'
      + '</p></div>' + '<p style="text-align: center;"><br/>You can continue in 30 seconds.</p>',
      trial_duration: 300,
      on_start: () => {
        save_data_csv();
      }
    },
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<h3 style="font-size: 2em; ">Block ${blockIdx + 1}/${nBlocks}</h3>`
      + '<p>'
      + 'Before continuing with the next set of images, please take a short break.'
      + '</p></div>' + CONTINUEEXP,
      choices: [" "],
    }
  ];
  return instrTimeline;
};

const createBlockInstructions2 = function(blockIdx, nBlocks, allowedKeys) {
  let instrTimeline = [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '<div style="text-align: center; font-size: 1.2em;">'
        + `<h3>Block ${blockIdx + 1}/${nBlocks}</h3>`
        + 'The following actions will be available:<br/><br/>'
        + '<div style="display: flex; justify-content: center; gap: 40px;">'
        + showAvailableKeys(allowedKeys)
        + '</p></div>' + CONTINUEEXP,
      choices: [" "],
    }
  ];
  return instrTimeline;
};

const createTestInstructions = function() {
  instrTimeline = [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '<h3>Break</h3>'
      + '<p>'
      + 'There will be a final part to this experiment. Please take a break now.<br/><br/>'
      + 'You will be able to continue in <b>2 minutes</b>.',
      trial_duration: 120,
      on_start: () => {
        save_data_csv();
      }
    },
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '<h3>Break</h3>'
      + '<p>'
      + 'There will be a final part to this experiment. Please take a break now.'
      + '</p></div>' + CONTINUEEXP,
      choices: [" "]
    },
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '<h3>Final Phase</h3>'
      + '<p>'
      + 'In this last part of the experiment, we are <b>testing what you learned!</b><br/><br/>'
      + 'You will see all the images again, in mixed order, and will make choices like before. You will not see your points, but we are still tracking them!<br/><br/>'
      + '<b>All three keys</b> will be available at all times - press the key that you feel goes with the image. Even if you think you do not remember, <b>go with your instinct!</b><br/>'
      + '</p></div>' + CONTINUEEXP,
      choices: [" "]
    }]
  return instrTimeline
}

const createEndInstructions = function(id) {
  let instrTimeline = []

  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<h3>Experiment Complete</h3>' +
        '<p>Thank you for your participation!</p>' +
        '<p>Data is saving, please hold on...</p>',
    choices: [],
    trial_duration: 3000,
    on_start: () => {
      save_data_csv();
    }
  });
  instrTimeline.push({
    type: jsPsychFullscreen,
    fullscreen_mode: false,
    on_finish: () => {
      document.body.style.cursor = "default";
    },
  });
  const ptq_survey = `https://ucbpsych.qualtrics.com/jfe/form/SV_2ss0E5VtgTG2oZM?id=${id}`
  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<p>Thank you for contributing to the advancement of cognitive science!<br><br>` +
      `Your data is saved. Please fill out <a href=${ptq_survey}>this <b>required</b> survey</a> about your demographics.<br><br>` +
      `Once you complete the survey, it will take you back to receive credit.</p></div>`,
    choices: "NO_KEYS",
  });

  return instrTimeline
};
