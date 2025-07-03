// Basic variables
const actions = ["A1", "A2", "A3", "A4"]

// Function to create one full training block, including forced-choice trials and free-choice subblocks
function createTrainingBlock(blockDef) {

  const rewardProbs = blockDef.rewardProbs;
  const trainingTimeline = [];
  const actionKeyMap = blockDef.keyMapping;

  // Participant information
  trainingTimeline.push(...createBlockInstructions1(blockDef.label, blockDef.number));
  
  // Forced choice phase
  let forcedTrials = [];
  const shuffledActions = jsPsych.randomization.shuffle(actions);
  const forcedRewards = {};

  shuffledActions.forEach(actionLabel => {
    const key = actionKeyMap[actionLabel];
    const prob = blockDef.rewardProbs[actionLabel];
    const nOnes = Math.ceil(blockDef.nForcedReps * prob);
    const arr = Array(nOnes).fill(1).concat(Array(5 - nOnes).fill(0));
    forcedRewards[actionLabel] = jsPsych.randomization.shuffle(arr);

    for (let i = 0; i < blockDef.nForcedReps; i++) {
      forcedTrials.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => generateStimulus(`static/images/${blockDef.img}.jpg`, key) + showAvailableKeys(key),
        choices: [key],
        on_finish: d => {
          d.block = blockDef.blockNumber;
          d.n_force_rep = i;
          d.phase = 'fc';
          d.image = blockDef.img;
          d.action = actionLabel;
          d.key_action_mapping = blockDef.keyMapping;
          d.reward_probs = blockDef.rewardProbs;
          d.condition = blockDef.label;
          d.reward = forcedRewards[actionLabel][i];
        }
      });
      forcedTrials.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
          const r = jsPsych.data.get().last(1).values()[0].reward;
          return `<p style='color:${r === 1 ? "green" : "gray"}; font-size: 48px;'>${r === 1 ? "+1" : "0"}</p>`;
        },
        choices: "NO_KEYS",
        trial_duration: 1000,
      });
      }
  });
  const forcedList = [].concat(...shuffledActions.map(a => Array(blockDef.nForcedReps).fill(a)));

  forcedList.forEach(actionLabel => {
    const key = actionKeyMap[actionLabel];

    
  });
  //trainingTimeline.push(...forcedTrials);

  // Free (subset) choice phase
  let trialCount = 0
  blockDef.subblocks.forEach(sub => {
    const currentSubset = sub.subset;
    const allowedKeys = currentSubset.map(a => actionKeyMap[a]);
    const actionCounts = { A1: 0, A2: 0, A3: 0, A4: 0 };

    // Participant information
    trainingTimeline.push(...createBlockInstructions2(blockDef.label, blockDef.number, allowedKeys))

    // Training trails
    trainingTimeline.push({
      timeline: [
        { type: jsPsychHtmlKeyboardResponse, 
          stimulus: `<div style="text-align: center; font-size:64px">+
            <div style="display: flex; justify-content: center; gap: 40px;">`, 
            choices: "NO_KEYS", 
            trial_duration: 500 
        },
        {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: () => generateStimulus(`static/images/${blockDef.img}.jpg`, allowedKeys),
          choices: allowedKeys,
          trial_duration: 2000,
          on_finish: d => {
            d.block = blockDef.blockNumber;
            d.trial = trialCount;
            d.phase = 'training';
            d.image = blockDef.img;
            const key = d.response;
            const a = Object.entries(actionKeyMap).find(([k, v]) => v === key)?.[0];
            d.action = a;
            d.key_action_mapping = blockDef.keyMapping;
            d.reward_probs = blockDef.rewardProbs;
            d.condition = blockDef.label;
            d.subset = currentSubset;
            d.action_counts = actionCounts;
            d.available_keys = allowedKeys;
            d.reward = Math.random() < rewardProbs[a] ? 1 : 0;
            actionCounts[a]++;
            trialCount++;
          }
        },
        {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: () => {
            const r = jsPsych.data.get().last(1).values()[0].reward;
            return `<p style='color:${r === 1 ? "green" : "gray"}; font-size: 48px;'>${r === 1 ? "+1" : "0"}</p>`;
          },
          choices: "NO_KEYS",
          trial_duration: 1000,
        }
      ],
      loop_function: () => currentSubset.some(a => actionCounts[a] < sub.targets[a])
    });
  });
  return trainingTimeline;
};

function createTrainingPhase(allTrainingBlocksDef) {

    // Generate training blocks
    trainingBlocks = []
    allTrainingBlocksDef.forEach(blockDef => {
      trainingBlocks.push(createTrainingBlock(blockDef));
    });
    return trainingBlocks
};

// Test phase: free-choice with no feedback, each image shown 4 times
function createTestPhase(designVars, allTrainingBlocksDef) {
  const nTestReps = designVars.n_test_reps;
  const imgs = allTrainingBlocksDef.map(def => def.img);
  const actionCounts = { A1: 0, A2: 0, A3: 0, A4: 0 };
  const testTrials = jsPsych.randomization.shuffle(
    [].concat(...imgs.map(img => Array(nTestReps).fill(img)))
  );
  const testTimeline = [
	  {
	    type: jsPsychHtmlKeyboardResponse,
	    stimulus: `<h3>Test Block</h3><p>You may freely press any key. No feedback will be provided.</p><p>[Press SPACE to begin]</p>`,
	    choices: [" "]
	  }
  ];
  let trialCount = 0;
  testTrials.forEach(img => {
	  testTimeline.push(
	    {
	  	  type: jsPsychHtmlKeyboardResponse,
	  	  stimulus: '<div style="font-size:64px">+</div>',
	  	  choices: "NO_KEYS",
	  	  trial_duration: 500
	    },
	    {
	  	  type: jsPsychHtmlKeyboardResponse,
	  	  stimulus: () => generateStimulus(`static/images/${img}.jpg`, ["f", "g", "h", "j"]),
	  	  choices: ["f", "g", "h", "j"],
	  	  trial_duration: 2000,
	  	  on_finish: d => {
          blockDef = allTrainingBlocksDef.find(def => def.img === img);
          d.trial = trialCount;
          d.phase = 'test';
	  	    d.image = img;
          const key = d.response;
          const a = Object.entries(blockDef.keyMapping).find(([k, v]) => v === key)?.[0];
          d.action = a;
          d.key_action_mapping = blockDef.keyMapping;
          d.reward_probs = blockDef.rewardProbs;
          d.condition = blockDef.label;
          d.action_counts = actionCounts;
          d.available_keys = ["f", "g", "h", "j"];
	  	    d.reward = null;
          actionCounts[a]++;
          trialCount++;
	  	  }
	    },
	  );
  });
  return testTimeline;
};