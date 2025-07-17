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
            return generateStimulus(`static/images/feedback_${r}.jpg`, key);
          },
          choices: "NO_KEYS",
          trial_duration: 1000,
        }
      );
    }
  });
  const forcedList = [].concat(...shuffledActions.map(a => Array(blockDef.nForcedReps).fill(a)));
  //trainingTimeline.push(...forcedTrials);

  // Free (subset) choice phase
  let trialCount = 0
  blockDef.subblocks.forEach(sub => {
    const currentSubset = sub.subset;
    const allowedKeys = currentSubset.map(a => actionKeyMap[a]);
    let actionCounts = { A1: 0, A2: 0, A3: 0, A4: 0 };

    // Attention checks
    let idxCount = 0
    const idx_array = Array.from({ length: Math.max(...Object.values(sub.targets)) - 1 }, (_, i) => i + 1)
    const attention_check_idx = jsPsych.randomization.sampleWithoutReplacement(idx_array, 2);
    const attention_check_imgs = jsPsych.randomization.shuffle(allowedKeys)
    const attention_check_dict = {};
    attention_check_idx.forEach((idx, i) => {
      attention_check_dict[idx] = attention_check_imgs[i];
    });

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
          stimulus: () => {
            if (attention_check_idx.includes(idxCount)) {
              return generateStimulus(`static/images/${attention_check_dict[idxCount]}.jpg`, allowedKeys);
            }
            else {
              return generateStimulus(`static/images/${blockDef.img}.jpg`, allowedKeys);
            }
          },
          choices: allowedKeys,
          trial_duration: 2000,
          
          // Save data
          on_finish: d => {
            d.block = blockDef.blockNumber;
            d.trial = trialCount;
            d.phase = 'training';
            const key = d.response;
            const a = Object.entries(actionKeyMap).find(([k, v]) => v === key)?.[0];
            d.action = a;
            d.key_action_mapping = blockDef.keyMapping;
            d.reward_probs = blockDef.rewardProbs;
            d.condition = blockDef.label;
            d.subset = currentSubset;
            d.available_keys = allowedKeys;
            if (attention_check_idx.includes(idxCount)) {
              d.image = attention_check_dict[idxCount];
              d.attention_check = true;
            }
            else {
              d.image = blockDef.img;
              d.attention_check = false;
              if (['A1', 'A3'].includes(a)) {
                d.reward = blockDef.rewards[a][actionCounts[a]];
              }
              else {
                d.reward = Math.random() < rewardProbs[a] ? 1 : 0;
              }
            }
            if (a in actionCounts && !attention_check_idx.includes(idxCount)) {
              actionCounts[a]++;
            }
            d.a1_count = actionCounts['A1'];
            d.a2_count = actionCounts['A2'];
            d.a3_count = actionCounts['A3'];
            d.a4_count = actionCounts['A4'];
            trialCount++;
            idxCount++;
          }
        },
        {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: () => {
            const a = jsPsych.data.get().last(1).values()[0].action;
            const key = jsPsych.data.get().last(1).values()[0].response;
            if (attention_check_idx.includes(idxCount - 1)) {  // -1 because idxCount is already increased by 1 in previous element
              if (key == attention_check_dict[idxCount - 1]) {
                return generateStimulus(`static/images/feedback_1.jpg`, allowedKeys);
              }
              else {
                return `<p style='color:red; font-size: 48px;'>Incorrect!</p>`;
              }
            }
            else {
              if (typeof a === 'undefined') {
                return `<p style='color:red; font-size: 48px;'>Too slow!</p>`;
              }
              if (!allowedKeys.includes(key)) {
                return `<p style='color:red; font-size: 48px;'>Button not available!</p>`;
              }
              else {
                const r = jsPsych.data.get().last(1).values()[0].reward;
                return generateStimulus(`static/images/feedback_${r}.jpg`, allowedKeys);
              }
            }
          },
          choices: "NO_KEYS",
          trial_duration: 1000,
        }
      ],
      loop_function: d => {
        below_max_target = currentSubset.some(a => actionCounts[a] < sub.targets[a]);
        console.log(actionCounts)
        console.log(sub.targets)
        below_max_total_trials = Object.values(actionCounts).reduce((sum, count) => sum + count, 0) < Math.max(...Object.values(sub.targets)) * 4;  // making sure that people can't get stuck in a subblock
        console.log(Object.values(actionCounts).reduce((sum, count) => sum + count, 0))
        return below_max_target && below_max_total_trials;
      }
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
  const shuffledImgs = jsPsych.randomization.shuffle(imgs);
  const testTrials = [].concat(...Array(4).fill(shuffledImgs));
  const actionCounts = { A1: 0, A2: 0, A3: 0, A4: 0 };
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