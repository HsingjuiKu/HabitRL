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
    message: '<p style="font: 16pt Microsoft YaHei; text-align: left; line-height: 1.6em">'+
      '<b>' + 'Welcome to this experiment! Before we begin, ensure the following:<br/>'
      + '(1) Use a computer and a modern browser (Chrome, Edge, Firefox, or Safari)<br/>'
      + '(2) Close or minimize other programs and turn off all notifications<br/>'
      + '(3) Silence your phone and minimize background noise<br/>'
      + '(4) Do not exit full screen during the experiment<br/>'
      + '</b>' + 'If you agree to participate and understand the requirements, click to start:' + '</p>',
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
    stimulus: `<div class='center'><p>In this experiment, you will see a series of images on the screen.<br><br>
    Please respond to each image by pressing one of the four buttons on the keyboard, F, G, H, or J, with your dominant hand.<br><br>
    At each time, only a subset of these four buttons will be available.<br><br>
    This will be indicated to you below the image.<br><br>
    </p></div>` + CONTINUE,
    choices: ["Enter"],
  });
  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<div class='center'><p>Pressing a button in response to an image can give you <span style="color:red;">0</span> or <span style="color:green;">+1</span> point<br><br>
    The probability of receiving <span style="color:red;">0</span> or <span style="color:green;">+1</span> point differs for each button and each image.<br><br>
    Your goal is to collect as many points as possible.<br><br>
    At each iteration, you have two seconds to respond.<br><br>
    If you do not respond, the trial will be counted as a loss.
    </p></div>` + CONTINUE,
    choices: ["Enter"],
  });
  instrTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<div class='center'><p>Push the space bar to try this task out.<br><br>
    </p></div>` + CONTINUE,
    choices: ["Enter"],
  });

  return instrTimeline
}