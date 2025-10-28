function createTrainingPhase(BlockDefs) {
  
  const trainingTimeline = [];
  BlockDefs.forEach((blockDef, blockIdx) => {

    // Participant information
    if (blockIdx > 0 && blockIdx < (blockDef.nBlocks)) {
      trainingTimeline.push(...createBlockInstructions1(blockIdx, blockDef.nBlocks));
    }

    // Definitions
    let trialIdx = 0
    let imgCounts = {};  // functional, counts all trials
    let stimCounts = {};  // for data saving, only counts valid trials
    let actionCounts = {};
    let subsets = {};  // which actions should be available
    let imgOrder = shuffleImgOrder(blockDef);
    for (let i = 0; i < blockDef.setSize; i++) {
      imgCounts[i] = 0;
      stimCounts[i] = 0;
      actionCounts[i] = {A1: 0, A2: 0, A3: 0};
      subsets[i] = shuffleSubsets(blockDef);
    }

    // Attention checks
    const idx_array = Array.from({ length: imgOrder.length * blockDef.setSize }, (_, i) => i)
    const attention_check_idx = jsPsych.randomization.sampleWithoutReplacement(idx_array, blockDef.nAttChecks);  // set number of attention checks here
    attention_check_idx.sort((a, b) => a - b);

    // Intro trials
    if (blockDef.includeIntro > 0) {
      //const initOrder = jsPsych.randomization.shuffle(Array.from({ length: blockDef.setSize }, (_, i) => i));
      const initOrder = Array.from({ length: blockDef.setSize }, (_, i) => i);

      // Generate rewards
      aRewards = {};
      keyRewards = {};
      for (let i = 0; i < blockDef.setSize; i++) {
        if (blockDef.rewardValues) {
          aRewards[i] = actions.reduce((acc, act) => {
            acc[act] = Array.from({ length: blockDef.includeIntro }, () => {
              let r = jsPsych.randomization.sampleNormal(blockDef.rewardValues[act], blockDef.rewardSD);
              return Math.max(0, Math.round(r * 10) / 10);
            });
            return acc;
          }, {});
        } else {
          aRewards[i] = actions.reduce((acc, act) => {
            const nOnes = Math.round(blockDef.rewardProbs[act] * blockDef.includeIntro);
            const arr = Array(nOnes).fill(1).concat(Array(blockDef.includeIntro - nOnes).fill(0));
            acc[act] = jsPsych.randomization.shuffle(arr);
            return acc;
          }, {});
        }
        keyRewards[i] = {};
        Object.entries(aRewards[i]).forEach(([act, reward]) => {
          const key = blockDef.keyMapping[i][act];
          keyRewards[i][key] = reward;
        });
      }

      // Present rewards
      for (let i = 0; i < blockDef.setSize; i++) {
        trainingTimeline.push({
          timeline: [
            // Stimulus
            {
              type: jsPsychHtmlKeyboardResponse,
              stimulus: () => {
                img = blockDef.imgs[initOrder[i]]
                return generateStimulus(`static/images/${img}.jpg`, keys);
              },
              choices: [" "],
            },
          ]
        })
        for (let j = 0; j < blockDef.includeIntro; j++) {
          trainingTimeline.push({
            timeline: [
            // Feedback (+ Stimulus)
            {
              type: jsPsychHtmlKeyboardResponse,
              stimulus: () => {
                rewards = {};
                Object.keys(keyRewards[initOrder[i]]).forEach(key => {
                  rewards[key] = keyRewards[initOrder[i]][key][j];
                });
                img = blockDef.imgs[initOrder[i]];
                return generateStimulus(`static/images/${img}.jpg`, keys, rewards, null, true);
              },
              choices: " ",
            },
            // Stimulus
            {
              type: jsPsychHtmlKeyboardResponse,
              stimulus: () => {
                img = blockDef.imgs[initOrder[i]]
                return generateStimulus(`static/images/${img}.jpg`, keys);
              },
              trial_duration: 200,
            },
          ],
          })
        }
      }
    }

    // Training trails
    trainingTimeline.push({
      timeline: [
        // Fixation cross
        { 
          type: jsPsychHtmlKeyboardResponse, 
          stimulus: () => {
            const imgIdx = imgOrder[trialIdx];
            if (imgIdx == undefined) {
              x = 1
            }
            const availableActions = subsets[imgIdx][imgCounts[imgIdx]];
            if (availableActions == undefined) {
              x = 1
            }
            const availableKeys = availableActions.map(a => blockDef.keyMapping[imgIdx][a]);
            return generateStimulus(`static/images/fix_cross.jpg`, availableKeys);
          }, 
          choices: "NO_KEYS", 
          trial_duration: 1000,
        },

        // Stimulus
        {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: () => {
            const imgIdx = imgOrder[trialIdx];
            const availableActions = subsets[imgIdx][imgCounts[imgIdx]];
            const availableKeys = availableActions.map(a => blockDef.keyMapping[imgIdx][a]);
            if (attention_check_idx.includes(trialIdx)) {
              img = jsPsych.randomization.sampleWithoutReplacement(availableKeys, 1)[0];
              window.attention_img = img;
            }
            else {
              img = blockDef.imgs[imgOrder[trialIdx]]
            }
            return generateStimulus(`static/images/${img}.jpg`, availableKeys);
          },
          choices: keys,
          trial_duration: 2000,

          // Save data
          on_finish: d => {
            const imgIdx = imgOrder[trialIdx];
            const availableActions = subsets[imgIdx][imgCounts[imgIdx]];
            const availableKeys = availableActions.map(a => blockDef.keyMapping[imgIdx][a]);
            const key = d.response;
            const action = Object.entries(blockDef.keyMapping[imgIdx]).find(([k, v]) => v === key)?.[0];
            d.phase = 'training';
            d.block = blockIdx;
            d.trial = trialIdx;
            d.action = action;
            d.a1_key = blockDef.keyMapping[imgIdx]['A1'];
            d.a2_key = blockDef.keyMapping[imgIdx]['A2'];
            d.a3_key = blockDef.keyMapping[imgIdx]['A3'];
            d.reward_probs = blockDef.rewardProbs;
            d.reward_values = blockDef.rewardValues;
            d.reward_sd = blockDef.rewardSD;
            d.condition = blockDef.condition;
            d.available_keys = availableKeys;
            if (attention_check_idx.includes(trialIdx)) {
              d.image = window.attention_img;
              d.attention_check = true;
              d.reward = key == d.image ? 1 : 0;
            } else {  
              d.image = blockDef.imgs[imgIdx]
              d.attention_check = false;
              if (availableKeys.includes(key)) { // valid trial
                d.valid = true;
                actionCounts[imgIdx][action]++;
                stimCounts[imgIdx]++;

                // Determine rewards
                if (blockDef.rewardValues) {
                  d.aRewards = actions.reduce((acc, act) => {
                    r = jsPsych.randomization.sampleNormal(blockDef.rewardValues[act], blockDef.rewardSD);
                    r = Math.max(0, Math.round(r * 10) / 10);
                    acc[act] = r;
                    return acc;
                  }, {});
                } else {
                  d.aRewards = actions.reduce((acc, act) => {
                    r = Math.random() < blockDef.rewardProbs[act] ? 1 : 0;
                    acc[act] = r;
                    return acc;
                  }, {});
                }
                d.keyRewards = {};
                Object.entries(d.aRewards).forEach(([act, reward]) => {
                  const key = blockDef.keyMapping[imgIdx][act];
                  d.keyRewards[key] = reward;
                });
                d.reward = d.keyRewards[key];
                if (action == 'A3') {
                  imgOrder.push(imgIdx)  // if A3 was pressed, repeat trial later
                  subsets[imgIdx].push(subsets[imgIdx][imgCounts[imgIdx]])
                } else if (action == 'A2' && availableActions.includes('A1')) {
                  [imgOrder, subsets] = changeTrial(imgOrder, trialIdx, imgCounts, subsets)  // control for "errors" during A1-A2 comparisons
                }
                d.s_count = stimCounts[imgIdx];
                d.a1_count = actionCounts[imgIdx]['A1'];
                d.a2_count = actionCounts[imgIdx]['A2'];
                d.a3_count = actionCounts[imgIdx]['A3'];
                d.action_counts = actionCounts;
              } else if (!availableKeys.includes(key)) {  // invalid trial
                d.valid = false;
                imgOrder.push(imgIdx)  // if invalid trial, repeat later
                subsets[imgIdx].push(subsets[imgIdx][imgCounts[imgIdx]])
              }
            }
            //console.log(trialIdx, '--------')
            //console.log(imgIdx)
            //console.log(action)
            //console.log(JSON.parse(JSON.stringify(actionCounts)))
            //console.log(JSON.parse(JSON.stringify(subsets)))
            //console.log(JSON.parse(JSON.stringify(imgOrder)))
          }
        },

        // Feedback
        {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: () => {
            const action = jsPsych.data.get().last(1).values()[0].action;
            const key = jsPsych.data.get().last(1).values()[0].response;
            const imgIdx = imgOrder[trialIdx]
            const availableActions = subsets[imgIdx][imgCounts[imgIdx]]
            const availableKeys = availableActions.map(a => blockDef.keyMapping[imgIdx][a]);
            const actionCounts = jsPsych.data.get().last(1).values()[0].action_counts;
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
            } else {  // if regular trial
              imgCounts[imgIdx]++;
              trialIdx++;  
              if (typeof action === 'undefined') {
                return `<p style='color:red; font-size: 48px;'>Too slow!</p>`;
              } else if (!availableKeys.includes(key)) {
                return `<p style='color:red; font-size: 48px;'>Button not available!</p>`;
              } else {
                // Determine whether to show rewards or not
                showRewards = true;
                if (
                  blockDef.condition == 1
                  && actionCounts[imgIdx][action] > (blockDef.nActionTargets['A2'] - blockDef.nNoFeedbackTrials) 
                  && ['A2'].includes(action)
                  && availableActions.includes('A3')
                ) {
                  showRewards = false;
                }
                if (showRewards) {
                  rewards = jsPsych.data.get().last(1).values()[0].keyRewards;
                } else {
                  rewards = null
                }
                return generateStimulus(`static/images/empty.jpg`, availableKeys, rewards, key, blockDef.completeReward);
              }
            }
          },
          choices: "NO_KEYS",
          trial_duration: 1000,
        }
      ],
      loop_function: () => {
        // Block end condition
        let complete = Array(blockDef.setSize).fill(false);
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
        if (complete.includes(false) || (trialIdx < imgOrder.length)) {
          return true;
        } else {
          return false;
        }
      }
    });
  });
  return trainingTimeline
};