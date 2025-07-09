/* createInstruction builds the sequence of your instructions. each instruction slide
is an object to be pushed to the instrTimeline. You'll mainly have to replace the value for
the stimulus property. The type will be "html-button-response" if you're using a button
or "html-keyboard-response" for keys. Check jsPsych to see more configurations. */

const CONTINUE = '<p class="continue" style="font-size: 1.2em; ">[Press SPACE to continue]</p>'; // instruction page footer

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
    stimulus: '<h3 style="font-size: 2em; ">Instruction 1/6</h3>'
    + '<p style="text-align: left; line-height: 1.6em; font-size: 1.2em; max-width: 800px; margin: 0 auto; word-wrap: break-word;">'
    + 'In this experiment, you will see a series of images on the screen.<br/><br/>'
    + 'You can respond to each image by pressing one of the following buttons on the keyboard:'
    + '</p>'
    + `<div style="display: flex; justify-content: center; gap: 40px; margin: 20px 0;">`
    + showAvailableKeys(['f', 'g', 'h', 'j'])
    + '</div>' + CONTINUE,
    choices: [" "],
  });
  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<h3 style="font-size: 2em; ">Instruction 2/6</h3>'
    + '<p style="text-align: left; line-height: 1.6em; font-size: 1.2em; max-width: 800px; margin: 0 auto; word-wrap: break-word;">'
    + 'Pressing a button in response to an image can give you <span style="color:red;">0</span> or <span style="color:green;">+1</span> points<br/>'
    + 'Your goal is to <b>collect as many points as possible!</b><br/><br/>'
    + 'How often you receive <span style="color:red;">0</span> or <span style="color:green;">+1</span> points <b>depends on each button and each image</b>: '
    + 'some will give you points more often, others rarely. <b>Try to figure it out!</b><br/>'
    + '</p></div>' + CONTINUE,
    choices: [" "],
  });
  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<h3 style="font-size: 2em; ">Instruction 3/6</h3>'
    + '<p style="text-align: left; line-height: 1.6em; font-size: 1.2em; max-width: 800px; margin: 0 auto; word-wrap: break-word;">'
    + 'When the image is shown, you have <b>two seconds</b> to respond - make sure to answer in that time, or the trial is <b>lost!</b><br/>'
    + 'You will see a + sign between each trial. Keep your eyes on it to be ready to focus on the next image!<br/>'
    + '</p></div>' + CONTINUE,
    choices: [" "],
  });
  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<h3 style="font-size: 2em; ">Instruction 4/6</h3>'
    + '<p style="text-align: left; line-height: 1.6em; font-size: 1.2em; max-width: 800px; margin: 0 auto; word-wrap: break-word;">'
    + 'For each image you will learn all four buttons on the keyboard.<br/><br/>'
    + 'However, you will not always be allowed to press all four buttons. You will see which are available under the image.<br/>'
    + 'For example, in this trial, only F and H are available - make sure you choose between <b>those two only</b>.<br/>'
    + `<div style="display: flex; justify-content: center; gap: 40px; margin: 20px 0;">`
    + showAvailableKeys(['f', 'h'])
    + '</p></div>' + CONTINUE,
    choices: [" "],
  });
  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<h3 style="font-size: 2em; ">Instruction 5/6</h3>'
    + '<p style="text-align: left; line-height: 1.6em; font-size: 1.2em; max-width: 800px; margin: 0 auto; word-wrap: break-word;">'
    + 'There will be 12 blocks, each with just one image to learn about. You can take short breaks between each block.<br/><br/>'
    + 'Each block will have just one image, but to make sure you are paying attention, we will also show you occasionally an instruction to <b>press a specific button</b>, like shown below.<br/>'
    + 'Make sure you <b>press the correct button</b>.<br/>'
    + '</p></div>' + CONTINUE,
    choices: [" "],
  });
  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<h3 style="font-size: 2em; ">Instruction 6/6</h3>'
    + '<p style="text-align: left; line-height: 1.6em; font-size: 1.2em; max-width: 800px; margin: 0 auto; word-wrap: break-word;">'
    + 'You will now start the main experiment.<br/>'
    + 'Before you start, please <b>position your dominant hand with one finger on each button</b>, and keep it there for the block duration!<br/>'
    + '</p></div>' + CONTINUE,
    choices: [" "],
  });
  return instrTimeline
};

const createBlockInstructions1 = function(condition, blockCount) {
  let instrTimeline = []

  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<h3 style="font-size: 2em; ">Image ${blockCount}</h3>`
    + '<p font-size: 1.2em;">'
    + 'For the next trials, only single actions will be available.'
    + '</p></div>' + CONTINUE,
    choices: [" "],
  });
  
  return instrTimeline
};

const createBlockInstructions2 = function(condition, blockCount, allowedKeys) {
  let instrTimeline = []
  let htmlString = `
    <div style="text-align: center; font-size: 1.2em;">
      <h3 style="font-size: 2em; ">Image ${blockCount}</h3>
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
	  stimulus: '<h3 style="font-size: 2em; ">Final Phase</h3>'
    + '<p style="text-align: left; line-height: 1.6em; font-size: 1.2em; max-width: 800px; margin: 0 auto; word-wrap: break-word;">'
    + 'In this last part of the experiment, we are testing what you learned!<br/>'
    + 'You will see all the images again, in mixed order, and will make choices like before. You will not see your points, but we are still tracking them!<br/>'
    + 'All four buttons will be available at all times - press the button that you feel goes with the image. Even if you think you do not remember, go with your instinct!<br/>'
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