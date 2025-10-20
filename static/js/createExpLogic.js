const actions = ["A1", "A2", "A3"]
const keys = ["f", "g", "h"] 

// Function to create one full training block, including forced-choice trials and free-choice subblocks
function createTrainingPhase(BlockDefs) {

  const trainingTimeline = [];
  BlockDefs.forEach((blockDef, blockIdx) => {

    // Participant information
    if (blockIdx > 0) {
      trainingTimeline.push(...createBlockInstructions1(blockDef.condition, blockIdx));
    }

    // Definitions
    let trialIdx = 0
    let imgCounts = {0: 0, 1: 0} // for functionality, does include invalid trials
    let stimCounts = {0: 0, 1: 0}; // for data saving, does not include invalid trails
    let actionCounts = {
      0: {A1: 0, A2: 0, A3: 0}, 
      1: {A1: 0, A2: 0, A3: 0},
    };
    let subsets = {
      0: jsPsych.randomization.shuffle([
        ...Array(blockDef.nActionTargets['A1']).fill(1),
        ...Array(blockDef.nActionTargets['A2']).fill(2)
      ]),
      1: jsPsych.randomization.shuffle([
        ...Array(blockDef.nActionTargets['A1']).fill(1),
        ...Array(blockDef.nActionTargets['A2']).fill(2)]),
    }
    const minNTrials = Object.values(blockDef.nActionTargets).reduce((sum, count) => sum + count, 0);  // per image
    const imgOrder = jsPsych.randomization.shuffle([
      ...Array(minNTrials).fill(0), 
      ...Array(minNTrials).fill(1)
    ]);

    // Attention checks
    const idx_array = Array.from({ length: minNTrials * 2 }, (_, i) => i + 1)
    const attention_check_idx = jsPsych.randomization.sampleWithoutReplacement(idx_array, blockDef.nAttChecks);  // set number of attention checks here
    attention_check_idx.sort((a, b) => a - b);
    const attention_check_imgs = Array(attention_check_idx.length / 2).fill().map(() => jsPsych.randomization.shuffle(keys)).flat()
    const attention_check_dict = {};
    attention_check_idx.forEach((idx, i) => {
      attention_check_dict[idx] = attention_check_imgs[i];
    });

    // Participant information
    //trainingTimeline.push(...createBlockInstructions2(blockDef.condition, blockIdx, keys))

    // Training trails
    trainingTimeline.push({
      timeline: [
        // Fixation cross
        { 
          type: jsPsychHtmlKeyboardResponse, 
          stimulus: () => {
            const imgIdx = imgOrder[trialIdx]
            const availableActions = subsets[imgIdx][imgCounts[imgIdx]] === 1 ? ['A1', 'A3'] : ['A2', 'A3']
            const availableKeys = availableActions.map(a => blockDef.keyMapping[imgIdx][a]);
            return generateStimulus(`static/images/fix_cross.jpg`, availableKeys);
          }, 
          choices: "NO_KEYS", 
          trial_duration: 1500,
        },

        // Stimulus
        {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: () => {
            if (attention_check_idx.includes(trialIdx)) {
              img = attention_check_dict[trialIdx]
            }
            else {
              img = blockDef.imgs[imgOrder[trialIdx]]
            }
            const imgIdx = imgOrder[trialIdx]
            const availableActions = subsets[imgIdx][imgCounts[imgIdx]] === 1 ? ['A1', 'A3'] : ['A2', 'A3']
            const availableKeys = availableActions.map(a => blockDef.keyMapping[imgIdx][a]);
            return generateStimulus(`static/images/${img}.jpg`, availableKeys);
          },
          choices: keys,
          trial_duration: 2000,

          // Save data
          on_finish: d => {
            const imgIdx = imgOrder[trialIdx]
            const availableActions = subsets[imgIdx][imgCounts[imgIdx]] === 1 ? ['A1', 'A3'] : ['A2', 'A3']
            const availableKeys = availableActions.map(a => blockDef.keyMapping[imgIdx][a]);
            const key = d.response;
            const a = Object.entries(blockDef.keyMapping[imgIdx]).find(([k, v]) => v === key)?.[0];
            d.phase = 'training';
            d.block = blockIdx;
            d.trial = trialIdx;
            d.action = a;
            d.a1_key = blockDef.keyMapping[imgIdx]['A1'];
            d.a2_key = blockDef.keyMapping[imgIdx]['A2'];
            d.a3_key = blockDef.keyMapping[imgIdx]['A3'];
            d.reward_probs = blockDef.rewardProbs;
            d.reward_values = blockDef.rewardValues;
            d.reward_sd = blockDef.rewardSD;
            d.condition = blockDef.condition;
            if (attention_check_idx.includes(trialIdx)) {
              d.image = attention_check_dict[trialIdx];
              d.attention_check = true;
              d.reward = key == d.image ? 1 : 0;
            }
            else {  // if regular trial
              d.image = blockDef.imgs[imgIdx]
              d.attention_check = false;
              if (availableKeys.includes(key)) { // valid trial
                d.valid = true;
                d.aRewards = actions.reduce((acc, act) => {
                    r = jsPsych.randomization.sampleNormal(blockDef.rewardValues[act], blockDef.rewardSD);
                    r = Math.round(r * 10) / 10;
                    acc[act] = r;
                  return acc;
                }, {});
                d.keyRewards = {};
                Object.entries(d.aRewards).forEach(([act, reward]) => {
                  const key = blockDef.keyMapping[imgIdx][act];
                  d.keyRewards[key] = reward;
                });
                d.reward = d.keyRewards[key];
                if (a == 'A3') {
                  imgOrder.push(imgIdx)  // if A3 was pressed, append that image to imgOrder again
                  subsets[imgIdx].push(subsets[imgIdx][imgCounts[imgIdx]])
                }
                actionCounts[imgIdx][a]++;
                stimCounts[imgIdx]++;
                d.s_count = stimCounts[imgIdx];
                d.a1_count = actionCounts[imgIdx]['A1'];
                d.a2_count = actionCounts[imgIdx]['A2'];
                d.a3_count = actionCounts[imgIdx]['A3'];
                d.action_counts = actionCounts;
              }
              else if (!availableKeys.includes(key)) {  // invalid trial
                d.valid = false;
                imgOrder.push(imgIdx);  // if response too slow or wrong button was pressed, append that image to imgOrder again
              }
            }
          }
        },

        // Feedback
        {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: () => {
            const a = jsPsych.data.get().last(1).values()[0].action;
            const key = jsPsych.data.get().last(1).values()[0].response;
            const attention_check = jsPsych.data.get().last(1).values()[0].attention_check;
            if (attention_check) {
              const image = jsPsych.data.get().last(1).values()[0].image;
              if (key == image) {
                feedback = `<p style='color:green; font-size: 48px;'>Correct!</p>`;
              }
              else {
                feedback = `<p style='color:red; font-size: 48px;'>Incorrect!</p>`;
              }
              attention_check_idx.shift(); // drop attention check element after it has been presented
              return feedback
            }
            else {  // if regular trial
              if (typeof a === 'undefined') {
                return `<p style='color:red; font-size: 48px;'>Too slow!</p>`;
              }
              else if (!keys.includes(key)) {
                return `<p style='color:red; font-size: 48px;'>Button not available!</p>`;
              }
              else {
                const imgIdx = imgOrder[trialIdx]
                const availableActions = subsets[imgIdx][imgCounts[imgIdx]] === 1 ? ['A1', 'A3'] : ['A2', 'A3']
                const availableKeys = availableActions.map(a => blockDef.keyMapping[imgIdx][a]);

                showRewards = true;
                //if (trialIdx > 0 && ['A1', 'A2'].includes(a)) {
                const actionCounts = jsPsych.data.get().last(1).values()[0].action_counts
                if (actionCounts[imgIdx][a] > 5 && ['A1', 'A2'].includes(a)) {
                  showRewards = false;
                }
                if (showRewards) {
                  rewards = jsPsych.data.get().last(1).values()[0].keyRewards;
                } else {
                  rewards = null
                }
                
                return generateStimulus(`static/images/fix_cross.jpg`, availableKeys, rewards, key);
              }
            }
          },
          choices: "NO_KEYS",
          trial_duration: 2000,
        }
      ],
      loop_function: () => {
        // Counters
        const imgIdx = imgOrder[trialIdx]
        imgCounts[imgIdx]++;
        trialIdx++;

        // Block end condition
        let complete = [false, false]
        for (const img in actionCounts) {
          for (const action in blockDef.nActionTargets) {
            if (actionCounts[img][action] < blockDef.nActionTargets[action]) {
              complete[img] = false;
              break;
            } else {
              complete[img] = true;
            }
          }
        }
        if (complete.includes(false)) {
          return true;
        }
      }
    });
  });
  return trainingTimeline
};

// Test phase: free-choice with no feedback, each image shown 4 times
function createTestPhase(designVars, allTrainingBlocksDef) {
  const nTestReps = designVars.n_test_reps;
  const nBlocks = designVars.n_blocks;
  const imgs = Array.from({ length: nBlocks * 2 }, (_, i) => i + 1);
  const shuffledImgs = jsPsych.randomization.shuffle(imgs);
  const testTrials = [].concat(...Array(nTestReps).fill(shuffledImgs));
  const actionCounts = { A1: 0, A2: 0, A3: 0};
  const testTimeline = createTestInstructions()
  let trialIdx = 0;
  testTrials.forEach(img => {
	  testTimeline.push(
	    {
	  	  type: jsPsychHtmlKeyboardResponse,
	  	  stimulus: () => generateStimulus(`static/images/fix_cross.jpg`, keys),
	  	  choices: "NO_KEYS",
	  	  trial_duration: 500
	    },
	    {
	  	  type: jsPsychHtmlKeyboardResponse,
	  	  stimulus: () => generateStimulus(`static/images/${img}.jpg`, keys),
	  	  choices: keys,
	  	  trial_duration: 2000,
	  	  on_finish: d => {
          const blockDef = allTrainingBlocksDef.find(def => Object.values(def.imgs).includes(img));
          const imgIdx = Object.keys(blockDef.imgs).find(key => blockDef.imgs[key] === img);
          d.phase = 'test';
          d.block = null;
          d.trial = trialIdx;
          const key = d.response;
          const a = Object.entries(blockDef.keyMapping[imgIdx]).find(([k, v]) => v === key)?.[0];
          d.action = a;
          d.a1_key = blockDef.keyMapping[imgIdx]['A1'];
          d.a2_key = blockDef.keyMapping[imgIdx]['A2'];
          d.a3_key = blockDef.keyMapping[imgIdx]['A3'];
          d.reward_probs = blockDef.rewardProbs;
          d.reward_values = blockDef.rewardValues;
          d.reward_sd = blockDef.rewardSD;
          d.condition = blockDef.condition;
          d.available_keys = keys;
	  	    d.image = img;
          d.attention_check = null;
          if (keys.includes(key)) {
            d.valid = true;
          } else {
            d.valid = false;
          }
	  	    d.reward = null;
          d.s_count = null;
          actionCounts[a]++;
          trialIdx++;
          d.a1_count = actionCounts['A1'];
          d.a2_count = actionCounts['A2'];
          d.a3_count = actionCounts['A3'];
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