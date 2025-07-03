// Basic variables
const actions = ["A1", "A2", "A3", "A4"]
const keys = ["f", "g", "h", "j"]

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
      forcedTrials.push(
        { type: jsPsychHtmlKeyboardResponse, 
          stimulus: () => generateStimulus(`static/images/fix_cross.jpg`, key),
            choices: "NO_KEYS", 
            trial_duration: 500 
        },
        {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: () => generateStimulus(`static/images/${blockDef.img}.jpg`, key),
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
      );
    }
  });
  const forcedList = [].concat(...shuffledActions.map(a => Array(blockDef.nForcedReps).fill(a)));

  forcedList.forEach(actionLabel => {
    const key = actionKeyMap[actionLabel];

    
  });
  trainingTimeline.push(...forcedTrials);

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
          stimulus: () => generateStimulus(`static/images/fix_cross.jpg`, allowedKeys), 
            choices: "NO_KEYS", 
            trial_duration: 500 
        },
        {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: () => generateStimulus(`static/images/${blockDef.img}.jpg`, allowedKeys),
          choices: keys,
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
            if (allowedKeys.includes(key)) {
              actionCounts[a]++;
            }
            trialCount++;
          }
        },
        {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: () => {
            const a = jsPsych.data.get().last(1).values()[0].action;
            const key = jsPsych.data.get().last(1).values()[0].response;
            if (typeof a === 'undefined') {
              return `<p style='color:red; font-size: 48px;'>Too slow!</p>`;
            }
            if (!allowedKeys.includes(key)) {
              return `<p style='color:red; font-size: 48px;'>Button not available!</p>`;
            }
            else {
              const r = jsPsych.data.get().last(1).values()[0].reward;
              return `<p style='color:${r === 1 ? "green" : "gray"}; font-size: 48px;'>${r === 1 ? "+1" : "0"}</p>`;
            }
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
  const testTimeline = createTestInstructions()
  let trialCount = 0;
  testTrials.forEach(img => {
	  testTimeline.push(
	    {
	  	  type: jsPsychHtmlKeyboardResponse,
	  	  stimulus: () => generateStimulus(`static/images/fix_cross.jpg`, ["f", "g", "h", "j"]),
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
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
          const a = jsPsych.data.get().last(1).values()[0].action;
          if (typeof a === 'undefined') {
            return `<p style='color:red; font-size: 48px;'>Too slow!</p>`;
          }
          else {
            return ''
          }
        },
        choices: "NO_KEYS",
        trial_duration: () => {
          const a = jsPsych.data.get().last(1).values()[0].action;
          if (typeof a === 'undefined') {
            return 1000;
          }
          else {
            return 1000;
          }
        },
      }
	  );
  });
  return testTimeline;
};