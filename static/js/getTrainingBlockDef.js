const getTrainingBlockDef = function getTrainingBlockDef(designVars) {
  const actions = ["A1", "A2", "A3"]

  // Unpack key design variables
  const rewardProbs = designVars["reward_probabilities"];
  const rewardValues = designVars["reward_values"];
  const rewardSD = designVars["reward_sd"];
  const setSize = designVars["set_size"];
  const nReps = designVars["n_repetitions"];
  const hFactor = designVars["h_factor"];
  const hFactorC1 = 1 // (hFactor - 1) / 2 + 1  // i.e., half of the factor of hFactor
  const nBlocks = designVars["n_blocks"];
  const nAttChecks = designVars["n_att_checks"];
  const nNoFeedbackTrials = designVars["n_no_feedback_trials"]

  // Latin square–based sets of action–key mappings (for each condition)
  shuffledActions = jsPsych.randomization.shuffle(actions)
  let actionKeyMappings = [
    { [shuffledActions[0]]: "f", [shuffledActions[1]]: "g", [shuffledActions[2]]: "h" },
    { [shuffledActions[0]]: "g", [shuffledActions[1]]: "h", [shuffledActions[2]]: "f" },
    { [shuffledActions[0]]: "h", [shuffledActions[1]]: "f", [shuffledActions[2]]: "g" },
    { [shuffledActions[0]]: "f", [shuffledActions[1]]: "g", [shuffledActions[2]]: "h" },
    { [shuffledActions[0]]: "g", [shuffledActions[1]]: "h", [shuffledActions[2]]: "f" },
    { [shuffledActions[0]]: "h", [shuffledActions[1]]: "f", [shuffledActions[2]]: "g" },
    { [shuffledActions[0]]: "f", [shuffledActions[1]]: "g", [shuffledActions[2]]: "h" },
    { [shuffledActions[0]]: "g", [shuffledActions[1]]: "h", [shuffledActions[2]]: "f" },
  ];
  
  if (Math.random() < 0.5) {  // switching first and second half randomly to equally distribute across conditions
    const half = Math.floor(actionKeyMappings.length / 2);
    const firstHalf = actionKeyMappings.slice(0, half);
    const secondHalf = actionKeyMappings.slice(half);
    actionKeyMappings = secondHalf.concat(firstHalf);
  }
  
  // Assign images
  let imgs_numbers = Array.from({ length: nBlocks * 2 }, (_, i) => i + 1);
  imgs_numbers = jsPsych.randomization.shuffle(imgs_numbers)

  // Construct all training blocks
  const blocks = [];
  for (let i = 0; i < nBlocks; i++) {
    const imgs = {};
    for (let j = 0; j < setSize; j++) {
      imgs[j] = imgs_numbers[i * setSize + j];
    }
    const condition = i < nBlocks / 2 ? nReps : nReps * hFactor; // First half Condition 1, last half Condition 2

    // Determine action-key mapping
    const keyMap = {}
    for (let j = 0; j < setSize; j++) {
      keyMap[j] = actionKeyMappings[(i + j) % actionKeyMappings.length];
    }
    
    // Determine number of required actions
    nActionTargets = {'A1': nReps, 'A2': condition, 'A3': 0};
    
    blocks.push({
      condition: condition,
      rewardProbs: rewardProbs,
      rewardValues: rewardValues,
      rewardSD: rewardSD,
      setSize: setSize,
      keyMapping: keyMap,
      nActionTargets: nActionTargets,
      imgs: imgs,
      nAttChecks: nAttChecks,
      nNoFeedbackTrials: nNoFeedbackTrials,
    });
  }

  // Randomize block order
  return jsPsych.randomization.shuffle(blocks);
}
