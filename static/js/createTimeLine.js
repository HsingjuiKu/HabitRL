const createTimeLine = function createTimeLine(imageList, designVars){
  const actions = ["A1", "A2", "A3", "A4"]
	
	// preload images
	const preload = {
	  type: jsPsychPreload,
	  images: imageList.map(img => `static/images/${img}`)
	};
	
  // Monitor tab visibility change to track if participant leaves the task window
  let num_tab_switches = 0;
  document.addEventListener("visibilitychange",()=>{
    if (document.visibilityState === "hidden"){
      if (num_tab_switches >= 3) { 
        // Abort experiment if participant left the page more than 3 times
        console.log('Ending exp because they left too many times');
        setTimeout(function(){
          jsPsych.finishTrial();
          jsPsych.abortExperiment('The task has ended. Thank you for your participation.');
        });
      } else {
        // Warn participant if they have left but not yet exceeded the threshold
        num_tab_switches += 1; 
        console.log(`Num switches: ${num_tab_switches}`);
        alert(`Please stay on the task page! You have left ${num_tab_switches} time(s).`)
      }
    }
  });

  let timeline = [];

  // Fullscreen entry prompt with instructions
  const fullscreen = {
    type: jsPsychFullscreen,
    fullscreen_mode: true,
    message: '<p style="font: 16pt Microsoft YaHei; text-align: left; line-height: 1.6em">'+
      '<b>'+ 'The test will begin in full screen mode. For best performance, please:<br/>'+ '(1) Use a computer and a modern browser (Chrome, Edge, Firefox, Safari, not IE)<br/>'+ '(2) Close or minimize other programs<br/>'+ '(3) Silence your phone and minimize background noise<br/>'+ '(4) Do not exit full screen during the test<br/>'+ '(5) Take the test seriously<br/><br/>'+ '</b>'+ 'If you agree to participate and understand the requirements, click to start:'+ '</p>',
    button_label: 'Click here to start in fullscreen',
    delay_after: 100
  };

  // Collect demographic information using a survey form
  const survey = {
    type: jsPsychSurvey,
    survey_json: {
      showQuestionNumbers: false,
      elements: [
        { name: "id", type: "text", title: "ID", inputType: "number", min: 0, max: 300, defaultValue: 0, isRequired: true },
        { type: 'text', title: 'Name', name: 'name', isRequired: true },
        { type: 'radiogroup', title: "Gender", name: 'sex', choices: ['Male', 'Female'], isRequired: true },
        { name: "age", type: "text", title: "Age", inputType: "number", min: 0, max: 100, defaultValue: null, isRequired: true },
        { type: 'text', name: 'tel', title: 'Phone number', inputType: 'tel', validators: [{ type: 'regex', regex: '[0-9]{10}', text: 'Please enter a valid phone number' }], isRequired: true },
        { type: 'dropdown', title: "Education", name: 'education', description: "Highest degree obtained", choices: ['Primary', 'Middle School', 'High School', 'Undergraduate', 'Master', 'PhD'], showOtherItem: false, showNoneItem: false, isRequired: true }
      ],
      completeText: 'Submit'
    },
    on_finish: data => {
      const responses = data.response;
      jsPsych.data.addProperties(responses);
    }
  };

  // Welcome screen before experiment starts; hides cursor
  const introduction = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<h2>Welcome to the experiment</h2><p>Please follow the instructions on screen.</p><p>Press Enter to begin</p>',
    choices: ["Enter"],
    on_finish: function () {
      const bodyNode = document.getElementsByTagName("body");
      for (let i = 0; i < bodyNode.length; i++) {
        bodyNode[i].style.cursor = "none";
      }
    }
  };

  // Function to create one full training block, including forced-choice trials and free-choice subblocks
  function createTrainingBlock(blockDef) {
    const rewardProbs = blockDef.rewardProbs;
    const blockTimeline = [];
    const actionKeyMap = blockDef.keyMapping;

    // Display condition label at block start
    blockTimeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<h3>${blockDef.label}</h3><p>Beginning forced-choice phase.</p><p>Press ENTER to continue</p>`,
      choices: ["Enter"]
    });

    // Forced-choice trials: each action shown a number of times
    let forcedTrials = [];
    shuffledActions = jsPsych.randomization.shuffle(actions)
    const forcedList = [].concat(...shuffledActions.map(a => Array(blockDef.nForcedReps).fill(a)));

    forcedList.forEach(actionLabel => {
      const key = actionKeyMap[actionLabel];
      forcedTrials.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => generateStimulus("red.jpg", key),
        choices: [key],
        trial_duration: 10000,
        on_finish: d => {
          d.action = actionLabel;
          d.reward = Math.random() < rewardProbs[actionLabel] ? 1 : 0;
        }
      });
      forcedTrials.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
          const r = jsPsych.data.get().last(1).values()[0].reward;
          return `<p style='color:${r === 1 ? "green" : "gray"}; font-size: 48px;'>${r === 1 ? "+1" : "0"}</p>`;
        },
        choices: "NO_KEYS",
        trial_duration: 1000
      });
    });
    //blockTimeline.push(...forcedTrials);

    // Loop over sub-blocks within the block
    blockDef.subblocks.forEach(sub => {
      const currentSubset = sub.subset;
      const allowedKeys = currentSubset.map(a => actionKeyMap[a]);
      const actionCounts = { A1: 0, A2: 0, A3: 0, A4: 0 };
      blockTimeline.push({
        timeline: [
          { type: jsPsychHtmlKeyboardResponse, stimulus: '<div style="font-size:64px">+</div>', choices: "NO_KEYS", trial_duration: 500 },
          {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: () => generateStimulus("red.jpg", allowedKeys),
            choices: allowedKeys,
            trial_duration: 10000,
            on_finish: d => {
              const key = d.response;
              const a = Object.entries(actionKeyMap).find(([k, v]) => v === key)?.[0];
              d.action = a;
              d.reward = Math.random() < rewardProbs[a] ? 1 : 0;
              actionCounts[a]++;
            }
          },
          {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: () => {
              const r = jsPsych.data.get().last(1).values()[0].reward;
              return `<p style='color:${r === 1 ? "green" : "gray"}; font-size: 48px;'>${r === 1 ? "+1" : "0"}</p>`;
            },
            choices: "NO_KEYS",
            trial_duration: 1000
          }
        ],
        loop_function: () => currentSubset.some(a => actionCounts[a] < sub.targets[a])
      });
    });

    return blockTimeline;
  }

    // Test phase: free response with no feedback
	const testBlock = (label) => {
	  const testTrials = jsPsych.randomization.shuffle(
		[].concat(...imageList.map(img => Array(4).fill(img))) // repeat each image 4 times
	  );

	  const block = [
		{
		  type: jsPsychHtmlKeyboardResponse,
		  stimulus: `<h3>${label}</h3><p>You may freely press any key. No feedback will be provided.</p><p>Press ENTER to begin</p>`,
		  choices: ["Enter"]
		}
	  ];

	  testTrials.forEach(imageFile => {
		block.push(
		  {
			type: jsPsychHtmlKeyboardResponse,
			stimulus: '<div style="font-size:64px">+</div>',
			choices: "NO_KEYS",
			trial_duration: 500
		  },
		  {
			type: jsPsychHtmlKeyboardResponse,
			stimulus: () => generateStimulus(`static/images/${imageFile}`, ["f", "g", "h", "j"]), // ✅ 用图片名生成stimulus
			choices: ["f", "g", "h", "j"],
			trial_duration: 10000,
			on_finish: d => {
			  d.image = imageFile;
			  d.reward = null;
			}
		  }
		);
	  });

	  return block;
	};

  // Generate training and test blocks
  const allTrainingBlocksDef = getTrainingBlockDef(designVars);
  const testblock = testBlock("Test Phase");

  // Final trial showing thank-you message and saving data
  const lastTrial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<h3>Experiment Complete</h3><p>Thank you for your participation!</p><p>Press ENTER to finish</p>',
    choices: ["Enter"],
    on_finish: () => {
      const id = jsPsych.data.get().values()[1].id || 'unknown';
      const d = new Date(), ymd = d.toISOString().slice(0,10).replace(/-/g, '');
      jsPsych.data.get().localSave('csv', `${id}-${ymd}.csv`);
    },
    trial_duration: 5000
  };

  // Exit fullscreen and show mouse cursor again
  const exitFullscreen = {
    type: jsPsychFullscreen,
    fullscreen_mode: false,
    on_finish: function () {
      var bodyNode = document.getElementsByTagName("body");
      for (let i = 0; i < bodyNode.length; i++) {
        bodyNode[i].style.cursor = "default";
      }
    }
  };

  // Push all phases into the timeline in correct order
	timeline.push(preload);
  //timeline.push(fullscreen);
  //timeline.push(survey);
  timeline.push(introduction);
  allTrainingBlocksDef.forEach(blockDef => {
    block = createTrainingBlock(blockDef);
    timeline.push(block);
  });
  timeline.push(...testblock);
  timeline.push(lastTrial);
  timeline.push(exitFullscreen);
	
	return timeline;
}