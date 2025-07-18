const getTrainingBlockDef = function getTrainingBlockDef(designVars) {

  // Unpack key design variables
  const rewardProbs = designVars["reward_probabilities"];
  const nReps = designVars["n_repetitions"];
  const hFactor = designVars["h_factor"];
  const hFactorC1 = (hFactor - 1) / 2 + 1  // i.e., half of the factor of hFactor
  const nBlocks = designVars["n_blocks"];

  // Latin square–based 6 sets of action–key mappings (for each condition)
  const actions = ["A1", "A2", "A3", "A4"]
  shuffledActions = jsPsych.randomization.shuffle(actions)
  let actionKeyMappings = [
    { [shuffledActions[0]]: "f", [shuffledActions[1]]: "g", [shuffledActions[2]]: "h", [shuffledActions[3]]: "j" },
    { [shuffledActions[0]]: "g", [shuffledActions[1]]: "h", [shuffledActions[2]]: "j", [shuffledActions[3]]: "f" },
    { [shuffledActions[0]]: "g", [shuffledActions[1]]: "j", [shuffledActions[2]]: "f", [shuffledActions[3]]: "h" },
    { [shuffledActions[0]]: "h", [shuffledActions[1]]: "f", [shuffledActions[2]]: "j", [shuffledActions[3]]: "g" },
    { [shuffledActions[0]]: "f", [shuffledActions[1]]: "g", [shuffledActions[2]]: "h", [shuffledActions[3]]: "j" },
    { [shuffledActions[0]]: "g", [shuffledActions[1]]: "h", [shuffledActions[2]]: "j", [shuffledActions[3]]: "f" },
    { [shuffledActions[0]]: "g", [shuffledActions[1]]: "j", [shuffledActions[2]]: "f", [shuffledActions[3]]: "h" },
    { [shuffledActions[0]]: "h", [shuffledActions[1]]: "f", [shuffledActions[2]]: "j", [shuffledActions[3]]: "g" },  // TODO
  ];
  
  // Assign images
  let imgs_numbers = Array.from({ length: nBlocks * 2 }, (_, i) => i + 1);
  imgs_numbers = jsPsych.randomization.shuffle(imgs_numbers)

  // Construct all training blocks
  const blocks = [];
  for (let i = 0; i < nBlocks; i++) {
    const imgs = {0: imgs_numbers[i * 2], 1: imgs_numbers[i * 2 + 1]}
    const isCond1 = i < nBlocks / 2; // First half Condition 1, last half Condition 2
    const condition = isCond1 ? 0 : 1;
    const subBlockOrder = i % 2 == 0 ? "A12A34" : "A34A12"  // Alternate order of sub-blocks
    const rewards = {  // initialize dict to pre-randomize rewards
      0: {'A1': null, 'A3': null},
      1: {'A1': null, 'A3': null}
    }

    // Determine action-key mapping
    const keyMap = {
      0: actionKeyMappings[i],
      1: {  // Flip action-key-mapping for second image
        'A1': actionKeyMappings[i]['A2'],
        'A2': actionKeyMappings[i]['A1'],
        'A3': actionKeyMappings[i]['A4'],
        'A4': actionKeyMappings[i]['A3'],
      }
    }
    
    if (condition == 0){

      // Pre-randomize rewards
      const rewardsA1 = new Array(nReps * hFactorC1).fill(0);
      const numOnesA1 = Math.round(nReps * hFactorC1 * rewardProbs['A1']);
      for (let j = 0; j < numOnesA1; j++) {
        rewardsA1[j] = 1;
      }
      rewards[0]['A1'] = jsPsych.randomization.shuffle(rewardsA1);
      rewards[1]['A1'] = jsPsych.randomization.shuffle(rewardsA1);

      const rewardsA3 = new Array(nReps * hFactorC1).fill(0);
      const numOnesA3 = Math.round(nReps * hFactorC1 * rewardProbs['A3']);
      for (let j = 0; j < numOnesA3; j++) {
        rewardsA3[j] = 1;
      }
      rewards[0]['A3'] = jsPsych.randomization.shuffle(rewardsA3);
      rewards[1]['A3'] = jsPsych.randomization.shuffle(rewardsA3);

      // Determine number of required actions
      if (subBlockOrder == "A12A34"){
        subblocks = [
          {subset: ['A1', 'A2'], targets: {'A1': nReps * hFactorC1, 'A2': 0}},
          {subset: ['A3', 'A4'], targets: {'A3': nReps * hFactorC1, 'A4': 0}}
        ];
      }
      else {
        subblocks = [
          {subset: ['A3', 'A4'], targets: {'A3': nReps * hFactorC1, 'A4': 0}},
          {subset: ['A1', 'A2'], targets: {'A1': nReps * hFactorC1, 'A2': 0}}
        ];
      }
    }
    else {

      // Pre-randomize rewards
      const rewardsA1 = new Array(nReps).fill(0);
      const numOnesA1 = Math.round(nReps * rewardProbs['A1']);
      for (let j = 0; j < numOnesA1; j++) {
        rewardsA1[j] = 1;
      }
      rewards[0]['A1'] = jsPsych.randomization.shuffle(rewardsA1);
      rewards[1]['A1'] = jsPsych.randomization.shuffle(rewardsA1);

      const rewardsA3 = new Array(nReps * hFactor).fill(0);
      const numOnesA3 = Math.round(nReps * hFactor * rewardProbs['A3']);
      for (let j = 0; j < numOnesA3; j++) {
        rewardsA3[j] = 1;
      }
      rewards[0]['A3'] = jsPsych.randomization.shuffle(rewardsA3);
      rewards[1]['A3'] = jsPsych.randomization.shuffle(rewardsA3);

      // Determine number of required actions
      if (subBlockOrder == "A12A34"){
        subblocks = [
          {subset: ['A1', 'A2'], targets: {'A1': nReps, 'A2': 0}},
          {subset: ['A3', 'A4'], targets: {'A3': nReps * hFactor, 'A4': 0}}
        ];
      }
      else {
        subblocks = [
          {subset: ['A3', 'A4'], targets: {'A3': nReps * hFactor, 'A4': 0}},
          {subset: ['A1', 'A2'], targets: {'A1': nReps, 'A2': 0}}
        ];
      }
    }
    
    blocks.push({
      condition: condition,
      rewardProbs: rewardProbs,
      keyMapping: keyMap,
      subblocks: subblocks,
      imgs: imgs,
      rewards: rewards
    });
  }

  // Randomize block order
  return jsPsych.randomization.shuffle(blocks);
}
