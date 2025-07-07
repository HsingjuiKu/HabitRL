const getTrainingBlockDef = function getTrainingBlockDef(designVars) {

  // Unpack key design variables
  const rewardProbs = designVars["reward_probabilities"];
  const nReps = designVars["n_repetitions"];
  const hFactor = designVars["h_factor"];
  const nForcedReps = designVars["n_forced_reps"];
  const nBlocks = designVars["n_blocks"];

  // Latin square–based 6 sets of action–key mappings (for each condition)
  const actions = ["A1", "A2", "A3", "A4"]
  shuffledActions = jsPsych.randomization.shuffle(actions)
  let actionKeyMappings = [
    { [shuffledActions[0]]: "f", [shuffledActions[1]]: "g", [shuffledActions[2]]: "h", [shuffledActions[3]]: "j" },
    { [shuffledActions[0]]: "g", [shuffledActions[1]]: "h", [shuffledActions[2]]: "j", [shuffledActions[3]]: "f" },
    { [shuffledActions[0]]: "h", [shuffledActions[1]]: "j", [shuffledActions[2]]: "f", [shuffledActions[3]]: "g" },
    { [shuffledActions[0]]: "j", [shuffledActions[1]]: "f", [shuffledActions[2]]: "g", [shuffledActions[3]]: "h" },
    { [shuffledActions[0]]: "f", [shuffledActions[1]]: "h", [shuffledActions[2]]: "g", [shuffledActions[3]]: "j" },
    { [shuffledActions[0]]: "h", [shuffledActions[1]]: "f", [shuffledActions[2]]: "j", [shuffledActions[3]]: "g" },
  ];

  // Assign images
  let imgs_numbers = Array.from({ length: 12 }, (_, i) => i + 1);
  imgs_numbers = jsPsych.randomization.shuffle(imgs_numbers)

  // Construct all training blocks
  function buildAllBlocks() {
    const hFactorC1 = (hFactor - 1) / 2 + 1
    const blocks = [];

    for (let i = 0; i < nBlocks; i++) {
      if (i % (nBlocks / 2) == 0) {  // Shuffle action-key mappings for each condition
        actionKeyMappings = jsPsych.randomization.shuffle(actionKeyMappings)
      }
      const isCond1 = i < nBlocks / 2; // First half Condition 1, last half Condition 2
      const condition = isCond1 ? "Condition 1" : "Condition 2";
      const keyMap = actionKeyMappings[i % (nBlocks / 2)]; // Select corresponding action–key mapping
      const subBlockOrder = i % 2 == 0 ? "A12A34" : "A34A12"  // Alternate order of sub-blocks
      
      if (condition == "Condition 1"){
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
        label: condition,
        rewardProbs: rewardProbs,
        keyMapping: keyMap,
        subblocks: subblocks,
        nForcedReps: nForcedReps,
        blockNumber: i,
        img: imgs_numbers[i]
      });
    }

    // Randomize the order of blocks before returning
    return jsPsych.randomization.shuffle(blocks);
  }

  // Generate and return the training blocks
  const allBlockDefs = buildAllBlocks();
  allBlockDefs.forEach((block, idx) => {
    block.number = idx + 1;
  });

  return allBlockDefs;
}
