const getTrainingBlockDef = function getTrainingBlockDef(designVars) {
  const actions = ["A1", "A2", "A3"]

  // Unpack key design variables
  const rewardProbs = designVars["reward_probabilities"];
  const rewardValues = designVars["reward_values"];
  const rewardSD = designVars["reward_sd"];
  const nReps = designVars["n_repetitions"];
  const hFactor = designVars["h_factor"];
  const hFactorC1 = 1 // (hFactor - 1) / 2 + 1  // i.e., half of the factor of hFactor
  const nBlocks = designVars["n_blocks"];

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
    const imgs = {0: imgs_numbers[i * 2], 1: imgs_numbers[i * 2 + 1]}
    const isCond1 = i < nBlocks / 2; // First half Condition 1, last half Condition 2
    const condition = isCond1 ? 0 : 1;

    // Determine action-key mapping
    const keyMap = {
      0: actionKeyMappings[i],
      1: {  // Flip action-key-mapping for second image
        'A1': actionKeyMappings[i]['A2'],
        'A2': actionKeyMappings[i]['A3'],
        'A3': actionKeyMappings[i]['A1'],
      }
    }
    
    // Determine number of required actions
    if (condition == 0){
      nActionTargets = {'A1': nReps, 'A2': nReps * hFactorC1, 'A3': 0};
    } else {
      nActionTargets = {'A1': nReps, 'A2': nReps * hFactor, 'A3': 0};
    }
    
    blocks.push({
      condition: condition,
      rewardProbs: rewardProbs,
      rewardValues: rewardValues,
      rewardSD: rewardSD,
      keyMapping: keyMap,
      nActionTargets: nActionTargets,
      imgs: imgs
    });
  }

  // Randomize block order
  return jsPsych.randomization.shuffle(blocks);
}
