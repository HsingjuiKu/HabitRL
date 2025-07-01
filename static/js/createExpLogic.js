const actions = ["A1", "A2", "A3", "A4"]

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
      stimulus: () => generateStimulus(`static/images/${blockDef.img}.jpg`, key),
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
  blockTimeline.push(...forcedTrials);

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
};

function createTrainingPhase(designVars) {

    // Define training blocks
    const allTrainingBlocksDef = getTrainingBlockDef(designVars);

    // Generate training blocks
    trainingBlocks = []
    allTrainingBlocksDef.forEach(blockDef => {
      trainingBlocks.push(createTrainingBlock(blockDef));
    });
    return trainingBlocks
};

// Test phase: free-choice with no feedback, each image shown 4 times
function createTestPhase(imgs) {
  const testTrials = jsPsych.randomization.shuffle(
	[].concat(...imgs.map(img => Array(4).fill(img)))
  );
  const block = [
	{
	  type: jsPsychHtmlKeyboardResponse,
	  stimulus: `<h3>Test Block</h3><p>You may freely press any key. No feedback will be provided.</p><p>Press ENTER to begin</p>`,
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