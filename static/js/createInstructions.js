/* createInstruction builds the sequence of your instructions. each instruction slide
is an object to be pushed to the instrTimeline. You'll mainly have to replace the value for
the stimulus property. The type will be "html-button-response" if you're using a button
or "html-keyboard-response" for keys. Check jsPsych to see more configurations. */

const CONTINUE = '<p class="continue">[Press ENTER to continue]</p>'; // instruction page footer

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
    + 'In this experiment, you will see a series of images on the screen.<br/>'
    + 'Please respond to each image by pressing a buttons on the keyboard with your dominant hand.<br/>'
    + 'At each time, only a subset of these four buttons will be available.<br/>'
    + 'This will be indicated to you below the image.<br/>'
    + '</p></div>' + CONTINUE,
    choices: ["Enter"],
  });
  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<p style="text-align: center; line-height: 1.6em">'
    + 'Pressing a button in response to an image can give you <span style="color:red;">0</span> or <span style="color:green;">+1</span> point<br/>'
    + 'The probability of receiving <span style="color:red;">0</span> or <span style="color:green;">+1</span> point differs for each button and each image.<br/>'
    + 'Your goal is to collect as many points as possible.<br/>'
    + '</p></div>' + CONTINUE,
    choices: ["Enter"],
  });
  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<p style="text-align: center; line-height: 1.6em">'
    + 'In each trial, you have two seconds to respond.<br/>'
    + 'If you do not respond in time, the trial will be counted as <span style="color:red;">0</span> points.'
    + '</p></div>' + CONTINUE,
    choices: ["Enter"],
  });
  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<p style="text-align: center; line-height: 1.6em">'
    + 'Press ENTER to try this task out.',
    choices: ["Enter"],
  });

  return instrTimeline
};

const createInstructions2 = function() {
  let instrTimeline = []

  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<p style="text-align: center; line-height: 1.6em">'
    + 'Well done! You can now continue with the main experiment.<br/>'
    + 'There will be 12 images, each of which will be presented repeatedly.<br/>'
    + '</p></div>' + CONTINUE,
    choices: ["Enter"],
  });
  
  return instrTimeline
};

const createBlockInstructions1 = function(condition, blockCount) {
  let instrTimeline = []

  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<h3>Stimulus ${blockCount} (${condition})</h3>`
    + 'No time limit. Only <b>single</b> actions will be available'
    + '</p></div>' + CONTINUE,
    choices: ["Enter"],
  });
  
  return instrTimeline
};

const createBlockInstructions2 = function(condition, blockCount, allowedKeys) {
  let instrTimeline = []
  let htmlString = `
    <div style="text-align: center;">
      <h3>Stimulus ${blockCount} (${condition})</h3>
      Two second time limit! The following actions will be available:<br/><br/>
      <div style="display: flex; justify-content: center; gap: 40px;">`;

  for (let key of ["f", "g", "h", "j"]) {
    const isActive = allowedKeys.includes(key);
    const opacity = isActive ? 1 : 0.3;
    const borderColor = isActive ? '#000' : '#999';

    htmlString += `
      <div style="
        text-align: center;
        font-size: 24px;
        opacity: ${opacity};
        border: 2px solid ${borderColor};
        border-radius: 8px;
        padding: 20px 15px;
        width: 60px;
        box-shadow: ${isActive ? '0 0 10px #333' : 'none'};
      ">
        ${key.toUpperCase()}<br>
      </div>
    `;
  }

  htmlString += '</p></div>' + CONTINUE;

  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: htmlString,
    choices: ["Enter"],
  });
  
  return instrTimeline
};

const createEndInstructions = function() {
  let instrTimeline = []
  // Final trial showing thank-you message and saving data
  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<h3>Experiment Complete</h3><p>Thank you for your participation!</p><p>Press ENTER to finish</p>',
    choices: ["Enter"],
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
    on_finish: function () {
      var bodyNode = document.getElementsByTagName("body");
      for (let i = 0; i < bodyNode.length; i++) {
        bodyNode[i].style.cursor = "default";
      }
    }
  })

  return instrTimeline
};