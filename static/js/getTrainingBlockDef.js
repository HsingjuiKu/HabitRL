const getTrainingBlockDef = function getTrainingBlockDef(designVars) {

  // Unpack key design variables
  const rewardProbs = designVars["reward_probabilities"];
  const rewardValues = designVars["reward_values"];
  const rewardSD = designVars["reward_sd"];
  const setSize = designVars["set_size"];
  const nA1Reps = designVars["n_a1_repetitions"];
  const nA2Reps = designVars["n_a2_repetitions"];
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
    let nA2RepsBlock
    if (Array.isArray(nA2Reps)) {
      nA2RepsBlock = nA2Reps[i % nA2Reps.length];
    } else {
      nA2RepsBlock = nA2Reps;
    }
    nActionTargets = {'A1': nA1Reps, 'A2': nA2RepsBlock, 'A3': 0};

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
        const nRewardA2 = Math.floor(nActionTargets['A2'] * rewardProbA2);
        rewardProbsBlock = {
          'A1': rewardProbs['A1'],
          'A2': rewardProbA2,
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
      nA2: nA2RepsBlock,
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
