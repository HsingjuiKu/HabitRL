// Basic variables
const actions = ["A1", "A2", "A3", "A4"]
const keys = ["f", "g", "h", "j"]

// Function to create one full training block, including forced-choice trials and free-choice subblocks
function createTrainingPhase(BlockDefs) {

  const trainingTimeline = [];
  BlockDefs.forEach((blockDef, blockIdx) => {

    // Participant information
    if (blockIdx > 0) {
      trainingTimeline.push(...createBlockInstructions1(blockDef.condition, blockIdx));
    }
    
    // Free (subset) choice phase
    let trialIdx = 0
    blockDef.subblocks.forEach(sub => {

      // Definitions
      let subTrialIdx = 0
      let actionCounts = {
        0: { A1: 0, A2: 0, A3: 0, A4: 0 }, 
        1: { A1: 0, A2: 0, A3: 0, A4: 0 }
      };
      const currentSubset = sub.subset;
      const minNTrials = Object.values(sub.targets).reduce((sum, count) => sum + count, 0);  // per image
      const allowedKeys = currentSubset.map(a => blockDef.keyMapping[0][a]);
      const imgOrder = jsPsych.randomization.shuffle([
        ...Array(minNTrials).fill(0), 
        ...Array(minNTrials).fill(1)
      ]);

      // Attention checks
      const idx_array = Array.from({ length: minNTrials * 2 }, (_, i) => i + 1)
      const attention_check_idx = jsPsych.randomization.sampleWithoutReplacement(idx_array, 0);  // set number of attention checks here
      const attention_check_imgs = jsPsych.randomization.shuffle(allowedKeys)
      const attention_check_dict = {};
      attention_check_idx.forEach((idx, i) => {
        attention_check_dict[idx] = attention_check_imgs[i];
      });

      // Participant information
      trainingTimeline.push(...createBlockInstructions2(blockDef.condition, blockIdx, allowedKeys))

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
              if (attention_check_idx.includes(subTrialIdx)) {
                stim = generateStimulus(`static/images/${attention_check_dict[subTrialIdx]}.jpg`, allowedKeys);
                return stim;
              }
              else {
                img = blockDef.imgs[imgOrder[subTrialIdx]]
                return generateStimulus(`static/images/${img}.jpg`, allowedKeys);
              }
            },
            choices: allowedKeys,
            trial_duration: 2000,

            // Save data
            on_finish: d => {
              const imgIdx = imgOrder[subTrialIdx]
              d.block = blockIdx;
              d.trial = trialIdx;
              d.phase = 'training';
              const key = d.response;
              const a = Object.entries(blockDef.keyMapping[imgIdx]).find(([k, v]) => v === key)?.[0];
              d.action = a;
              d.a1_key = blockDef.keyMapping[imgIdx]['A1'];
              d.a2_key = blockDef.keyMapping[imgIdx]['A2'];
              d.a3_key = blockDef.keyMapping[imgIdx]['A3'];
              d.a4_key = blockDef.keyMapping[imgIdx]['A4'];
              d.reward_probs = blockDef.rewardProbs;
              d.condition = blockDef.condition;
              d.subset = currentSubset;
              d.available_keys = allowedKeys;
              if (attention_check_idx.includes(subTrialIdx)) {
                d.image = attention_check_dict[subTrialIdx];
                d.attention_check = true;
              }
              else {  // if regular trial
                d.image = blockDef.imgs[imgIdx]
                d.attention_check = false;
                if (['A1', 'A3'].includes(a)) {
                  d.reward = blockDef.rewards[imgIdx][a][actionCounts[imgIdx][a]];  // get pre-randomized reward for current image and action index
                }
                else if (['A2', 'A4'].includes(a)) {
                  d.reward = Math.random() < blockDef.rewardProbs[a] ? 1 : 0;
                  imgOrder.push(imgIdx)  // if A2/A4 was pressed, append that image to imgOrder again
                }
                actionCounts[imgIdx][a]++;
                d.a1_count = actionCounts[imgIdx]['A1'];
                d.a2_count = actionCounts[imgIdx]['A2'];
                d.a3_count = actionCounts[imgIdx]['A3'];
                d.a4_count = actionCounts[imgIdx]['A4'];
                trialIdx++;
                subTrialIdx++;
              }
            }
          },
          {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: () => {
              const a = jsPsych.data.get().last(1).values()[0].action;
              const key = jsPsych.data.get().last(1).values()[0].response;
              const attention_check = jsPsych.data.get().last(1).values()[0].attention_check;
              if (attention_check) {
                const image = jsPsych.data.get().last(1).values()[0].image;
                if (key == image) {
                  return `<p style='color:green; font-size: 48px;'>Correct!</p>`;
                }
                else {
                  return `<p style='color:red; font-size: 48px;'>Incorrect!</p>`;
                }
                delete attention_check_dict[subTrialIdx]; // drop attention check element after it has been presented
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
        loop_function: () => {
          below_max_target = []
          for (i=0; i<2; i++) {
            below_max_target.push(currentSubset.some(a => actionCounts[i][a] < sub.targets[a]))
          }
          all_below_max_target = below_max_target.some(Boolean);
          console.log(actionCounts)
          console.log(sub.targets)
          return all_below_max_target
        }
      });
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
  const actionCounts = { A1: 0, A2: 0, A3: 0, A4: 0 };
  const testTimeline = createTestInstructions()
  let trialIdx = 0;
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
          const blockDef = allTrainingBlocksDef.find(def => Object.values(def.imgs).includes(img));
          const imgIdx = Object.keys(blockDef.imgs).find(key => blockDef.imgs[key] === img);
          d.trial = trialIdx;
          d.phase = 'test';
	  	    d.image = img;
          const key = d.response;
          const a = Object.entries(blockDef.keyMapping[imgIdx]).find(([k, v]) => v === key)?.[0];
          d.action = a;
          d.a1_key = blockDef.keyMapping[imgIdx]['A1'];
          d.a2_key = blockDef.keyMapping[imgIdx]['A2'];
          d.a3_key = blockDef.keyMapping[imgIdx]['A3'];
          d.a4_key = blockDef.keyMapping[imgIdx]['A4'];
          d.reward_probs = blockDef.rewardProbs;
          d.condition = blockDef.condition;
          d.available_keys = ["f", "g", "h", "j"];
	  	    d.reward = null;
          actionCounts[a]++;
          trialIdx++;
          d.a1_count = actionCounts['A1'];
          d.a2_count = actionCounts['A2'];
          d.a3_count = actionCounts['A3'];
          d.a4_count = actionCounts['A4'];
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