const createTimeLine = function createTimeLine(imageList){
    // This script defines the full timeline for a jsPsych experiment involving training and test phases,
    // with reward-based decision-making and enforced attention monitoring.
    // The function takes a list of image file names (imageList), sets up preload, fullscreen, survey, training blocks,
    // and testing blocks, then returns the full timeline to be passed into jsPsych.run().

    const actions = ["A1", "A2", "A3", "A4"];
    const keys = ["f", "g", "h", "j"];

    // Preload all image stimuli
    const preload = {
      type: jsPsychPreload,
      images: imageList.map(img => `static/images/${img}`)
    };

    // Monitor tab visibility and abort experiment if participant leaves the page too many times
    let num_tab_switches = 0;
    document.addEventListener("visibilitychange",()=>{
      if (document.visibilityState === "hidden"){
        if (num_tab_switches >= 3) { 
          console.log('Ending exp because they left too many times');
          setTimeout(function(){
            jsPsych.finishTrial();
            jsPsych.abortExperiment('The task has ended. Thank you for your participation.');
          });
        } else {
          num_tab_switches += 1; 
          console.log(`Num switches: ${num_tab_switches}`);
          alert(`Please stay on the task page! You have left ${num_tab_switches} time(s).`)
        }
      }
    });

    let timeline = [];

    // Fullscreen mode prompt with instructions
    const fullscreen = {
      type: jsPsychFullscreen,
      fullscreen_mode: true,
      message: '<p style="font: 16pt Microsoft YaHei; text-align: left; line-height: 1.6em">'+
        '<b>'+ 'The test will begin in full screen mode. For best performance, please:<br/>'+ '(1) Use a computer and a modern browser (Chrome, Edge, Firefox, Safari, not IE)<br/>'+ '(2) Close or minimize other programs<br/>'+ '(3) Silence your phone and minimize background noise<br/>'+ '(4) Do not exit full screen during the test<br/>'+ '(5) Take the test seriously<br/><br/>'+ '</b>'+ 'If you agree to participate and understand the requirements, click to start:'+ '</p>',
      button_label: 'Click here to start in fullscreen',
      delay_after: 100
    };

    // Participant demographic survey
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

    // Welcome screen, hides cursor
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

    // Create one training block from definition
    function createTrainingBlock(blockDef) {
      const rewardProbs = blockDef.rewardProbs;
      const blockTimeline = [];
      const actionKeyMap = blockDef.keyMapping;

      blockTimeline.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `<h3>${blockDef.label}</h3><p>Beginning forced-choice phase.</p><p>Press ENTER to continue</p>`,
        choices: ["Enter"]
      });

      // Forced-choice phase
      let forcedTrials = [];
      const forcedList = jsPsych.randomization.shuffle(
        Object.entries(blockDef.forcedTarget).flatMap(([a, n]) => Array(n).fill(a))
      );

      forcedList.forEach(actionLabel => {
        const key = actionKeyMap[actionLabel];
        forcedTrials.push({
          type: jsPsychHtmlKeyboardResponse,
          stimulus: () => generateStimulus("red.jpg", key),
          choices: [key],
          trial_duration: 1500,
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
          trial_duration: 500
        });
      });
      blockTimeline.push(...forcedTrials);

      // Sub-blocks (free-choice trials)
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
              trial_duration: 1500,
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
              trial_duration: 500
            }
          ],
          loop_function: () => currentSubset.some(a => actionCounts[a] < sub.targets[a])
        });
      });

      return blockTimeline;
    }

    // Test phase: free-choice with no feedback, each image shown 4 times
	const testBlock = (label) => {
	  const testTrials = jsPsych.randomization.shuffle(
		[].concat(...imageList.map(img => Array(4).fill(img)))
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
			stimulus: () => generateStimulus(`static/images/${imageFile}`, keys),
			choices: keys,
			trial_duration: 1500,
			on_finish: d => {
			  d.image = imageFile;
			  d.reward = null;
			}
		  }
		);
	  });

	  return block;
	};

    // Define and push all experiment phases
    const allTrainingBlocksDef = getTrainingBlockDef();
    const testblock = testBlock("Test Phase");

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

    // Exit fullscreen mode and show cursor
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

    // Construct the final timeline in proper order
	timeline.push(preload);
    timeline.push(fullscreen);
    timeline.push(survey);
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
