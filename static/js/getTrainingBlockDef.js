const getTrainingBlockDef = function getTrainingBlockDef(designVars) {

  // Unpack key design variables
  let rewardProbs = designVars["reward_probabilities"];
  let rewardValues = designVars["reward_values"];
  const rewardSD = designVars["reward_sd"];
  const setSize = designVars["set_size"];
  const nA1Reps = designVars["n_a1_repetitions"];
  let nA2Reps = designVars["n_a2_repetitions"];
  const nBlocks = designVars["n_blocks"];
  const nAttChecks = designVars["n_att_checks"];
  const nNoFeedbackTrials = designVars["n_no_feedback_trials"];
  const completeReward = designVars["complete_reward"];
  const includeIntro = designVars["include_intro"];
  const ACThreshold = designVars["AC_threshold"];
  const repeatElementsToLength = (values, length) => {
    if (!Array.isArray(values) || values.length === 0) {
      return values;
    }
    const nReps = Math.ceil(length / values.length);
    return values.flatMap(value => Array(nReps).fill(value)).slice(0, length);
  };
  
  // Assign images
  let imgs_numbers = Array.from({ length: nBlocks * setSize }, (_, i) => i + 1);
  imgs_numbers = jsPsych.randomization.shuffle(imgs_numbers)

  // Construct condition assignments per block
  nA2Reps = Array.from({ length: nBlocks }, (_, i) => {
    if (Array.isArray(nA2Reps)) {
      return nA2Reps[i % nA2Reps.length];
    }
    return nA2Reps;
  });
  if (rewardProbs == null) {
    rewardValues['A2'] = repeatElementsToLength(rewardValues['A2'], nBlocks);
  } else if (rewardValues == null) {
    rewardProbs['A2'] = repeatElementsToLength(rewardProbs['A2'], nBlocks);
  }
  
  // Construct all training blocks
  const blocks = [];
  for (let i = 0; i < nBlocks; i++) {

    // Assign images
    const imgs = {};
    for (let j = 0; j < setSize; j++) {
      imgs[j] = imgs_numbers[i * setSize + j];
    }

    // Determine action-key mapping
    sA = jsPsych.randomization.shuffle(actions)
    let actionKeyMappings = jsPsych.randomization.shuffle([
      { [sA[0]]: "h", [sA[1]]: "j", [sA[2]]: "k" },
      { [sA[0]]: "j", [sA[1]]: "k", [sA[2]]: "h" },
      { [sA[0]]: "k", [sA[1]]: "h", [sA[2]]: "j" },
    ]);
    const keyMap = {}
    for (let j = 0; j < setSize; j++) {
      keyMap[j] = actionKeyMappings[j];
    }

    // Determine number of required actions
    nActionTargets = {'A1': nA1Reps, 'A2': nA2Reps[i], 'A3': 0};

    // Determine reward values
    let rewardValuesBlock
    let rewardProbsBlock
    let rewardsRand
    if (rewardProbs == null) {
      if (Array.isArray(rewardValues['A2'])) {
        rewardValuesBlock = {
          'A1': rewardValues['A1'],
          'A2': rewardValues['A2'][i],
          'A3': rewardValues['A3'],
        };
      } else {
        rewardValuesBlock = rewardValues
      }
    } else if (rewardValues == null) {
      if (Array.isArray(rewardProbs['A2'])) {
        const rewardProbA2 = rewardProbs['A2'][i];
        const nRewardA2 = Math.floor(nActionTargets['A2'] * rewardProbA2);
        rewardProbsBlock = {
          'A1': rewardProbs['A1'],
          'A2': rewardProbs['A2'][i],
          'A3': rewardProbs['A3'],
        };
        rewardsRand = {};
        for (let j = 0; j < setSize; j++) {
          rewardsRand[j] = {
            'A1': 1,
            'A2': jsPsych.randomization.shuffle(
              Array(nRewardA2).fill(1).concat(Array(nActionTargets['A2']-nRewardA2).fill(0))
            ),
            'A3': 0,
          };
        }
      } else {
        rewardProbsBlock = rewardProbs
      }
    } else {
      console.warn("Warning: rewardProbs and rewardValues are both provided.");
    }
    
    blocks.push({
      nA1: nA1Reps,
      nA2: nA2Reps[i],
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
      ACThreshold: ACThreshold
    });
  }

  // Randomize block order
  return jsPsych.randomization.shuffle(blocks);
}
