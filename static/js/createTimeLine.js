// This script defines the full timeline for a jsPsych experiment involving training and test phases,
// with reward-based decision-making and enforced attention monitoring.
// The function takes a list of image file names (imgs), sets up preload, fullscreen, training blocks,
// and testing blocks, then returns the full timeline to be passed into jsPsych.run().

const createTimeLine = function createTimeLine(imgs, designVars){
  const actions = ["A1", "A2", "A3", "A4"]
	
	// Preload all image stimuli
	const preload = {
	  type: jsPsychPreload,
	  images: imgs.map(img => `static/images/${img}`)
	};
	
  // Monitor tab visibility and abort experiment if participant leaves the page too many times
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

  // Function to create one full training block, including forced-choice trials and free-choice subblocks
  function createTrainingBlock(blockDef) {
    const rewardProbs = blockDef.rewardProbs;
    const blockTimeline = [];
    const actionKeyMap = blockDef.keyMapping;

    // Participant information
    blockTimeline.push(...createBlockInstructions1(blockDef.label, blockDef.number))
    
    // Sub-blocks (free-choice trials)
    let forcedTrials = [];
    shuffledActions = jsPsych.randomization.shuffle(actions)
    const forcedList = [].concat(...shuffledActions.map(a => Array(blockDef.nForcedReps).fill(a)));

    forcedList.forEach(actionLabel => {
      const key = actionKeyMap[actionLabel];
      forcedTrials.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => generateStimulus(`static/images/${blockDef.img}`, key),
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

      // Participant information
      blockTimeline.push(...createBlockInstructions2(blockDef.label, blockDef.number, allowedKeys))

      // Training trails
      blockTimeline.push({
        timeline: [
          { type: jsPsychHtmlKeyboardResponse, stimulus: '<div style="font-size:64px">+</div>', choices: "NO_KEYS", trial_duration: 500 },
          {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: () => generateStimulus(`static/images/${blockDef.img}.jpg`, allowedKeys),
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

  // Test phase: free-choice with no feedback, each image shown 4 times
	const testBlock = (label) => {
	  const testTrials = jsPsych.randomization.shuffle(
		[].concat(...imgs.map(img => Array(4).fill(img)))
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
			stimulus: () => generateStimulus(`static/images/${imageFile}`, ["f", "g", "h", "j"]),
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
  let timeline = [];
	timeline.push(preload);
  //timeline.push(...createInstructions1())
  // Practice block TODO
  //timeline.push(...createInstructions2())
  allTrainingBlocksDef.forEach(blockDef => {
    block = createTrainingBlock(blockDef);
    timeline.push(block);
  });
  timeline.push(...testblock);
  timeline.push(lastTrial);
  timeline.push(exitFullscreen);
	
	return timeline;
}
