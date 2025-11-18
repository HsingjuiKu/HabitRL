const getTrainingBlockDef = function getTrainingBlockDef(designVars) {

  // Unpack key design variables
  const rewardProbs = designVars["reward_probabilities"];
  const rewardValues = designVars["reward_values"];
  const rewardSD = designVars["reward_sd"];
  const setSize = designVars["set_size"];
  const nReps = designVars["n_repetitions"];
  const hFactor = designVars["h_factor"];
  const nBlocks = designVars["n_blocks"];
  const nAttChecks = designVars["n_att_checks"];
  const nNoFeedbackTrials = designVars["n_no_feedback_trials"];
  const completeReward = designVars["complete_reward"];
  const includeIntro = designVars["include_intro"];
  const ACThreshold = designVars["AC_threshold"];
  
  // Assign images
  let imgs_numbers = Array.from({ length: nBlocks * setSize }, (_, i) => i + 1);
  imgs_numbers = jsPsych.randomization.shuffle(imgs_numbers)

  // Construct all training blocks
  const blocks = [];
  for (let i = 0; i < nBlocks; i++) {

    // Assign images
    const imgs = {};
    for (let j = 0; j < setSize; j++) {
      imgs[j] = imgs_numbers[i * setSize + j];
    }

    // Assign condition (shuffle later)
    const condition = i < nBlocks / 2 ? nReps * hFactor : nReps;

    // Determine action-key mapping
    sA = jsPsych.randomization.shuffle(actions)
    let actionKeyMappings = jsPsych.randomization.shuffle([
      { [sA[0]]: "f", [sA[1]]: "g", [sA[2]]: "h" },
      { [sA[0]]: "g", [sA[1]]: "h", [sA[2]]: "f" },
      { [sA[0]]: "h", [sA[1]]: "f", [sA[2]]: "g" },
    ]);
    const keyMap = {}
    for (let j = 0; j < setSize; j++) {
      keyMap[j] = actionKeyMappings[j];
    }

    // Determine reward values
    let rewardValuesBlock
    let rewardProbsBlock
    let rewardsRand
    if (rewardProbs == null) {
      if (Array.isArray(rewardValues['A2'])) {
        rewardValuesBlock = {
          'A1': rewardValues['A1'],
          'A2': rewardValues['A2'][i % rewardValues['A2'].length],
          'A3': rewardValues['A3'],
        };
      } else {
        rewardValuesBlock = rewardValues
      }
    } else if (rewardValues == null) {
      if (Array.isArray(rewardProbs['A2'])) {
        const rewardProbA2 = rewardProbs['A2'][i % rewardProbs['A2'].length];
        const nRewardA2 = Math.floor(condition * rewardProbA2);
        rewardProbsBlock = {
          'A1': rewardProbs['A1'],
          'A2': rewardProbA2,
          'A3': rewardProbs['A3'],
        };
        rewardsRand = {
          'A1': 1,
          'A2': jsPsych.randomization.shuffle(
            Array(nRewardA2).fill(1).concat(Array(condition-nRewardA2).fill(0))
          ),
          'A3': 0,
        };
      } else {
        rewardProbsBlock = rewardProbs
      }
    } else {
      console.warn("Warning: rewardProbs and rewardValues are both provided.");
    }

    // Determine number of required actions
    nActionTargets = {'A1': nReps, 'A2': condition, 'A3': 0};
    
    blocks.push({
      condition: condition,
      rewardProbs: rewardProbsBlock,
      rewardsRand: rewardsRand,
      rewardValues: rewardValuesBlock,
      rewardSD: rewardSD,
      setSize: setSize,
      keyMapping: keyMap,
      nActionTargets: nActionTargets,
      imgs: imgs,
      nAttChecks: nAttChecks,
      nNoFeedbackTrials: nNoFeedbackTrials,
      completeReward: completeReward,
      includeIntro: includeIntro,
      nBlocks: nBlocks,
      nReps: nReps,
      ACThreshold: ACThreshold
    });
  }

  // Randomize block order
  return jsPsych.randomization.shuffle(blocks);
}
