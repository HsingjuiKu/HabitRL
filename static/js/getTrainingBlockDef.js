const getTrainingBlockDef = function getTrainingBlockDef(designVars) {

  // Unpack key design variables
  const rewardProbs = designVars["reward_probabilities"];
  const nReps = designVars["n_repetitions"];
  const hFactor = designVars["h_factor"];
  const nForcedReps = 1;
  const nBlocks = designVars["n_blocks"];

  // REPLACEME:Latin square–based 8 sets of action–key mappings
  const actionKeyMappings = [
    { A1: "f", A2: "g", A3: "h", A4: "j" },
    { A1: "g", A2: "h", A3: "j", A4: "f" },
    { A1: "h", A2: "j", A3: "f", A4: "g" },
    { A1: "j", A2: "f", A3: "g", A4: "h" },
    { A1: "f", A2: "h", A3: "g", A4: "j" },
    { A1: "h", A2: "f", A3: "j", A4: "g" },
  ];

  // Construct all 8 training blocks
  function buildAllBlocks() {
    const blocks = [];

    for (let i = 0; i < nBlocks; i++) {
      const isCond1 = i < 4; // First 4 are Condition 1, last 4 are Condition 2
      const condition = isCond1 ? "Condition 1" : "Condition 2";
      const keyMap = actionKeyMappings[i % (nBlocks / 2)]; // Select corresponding action–key mapping
      const subBlockOrder = i % 2 == 0 ? "A12A34" : "A34A12"  // Alternate order of sub-blocks
      
      if (condition == "Condition 1"){
        if (subBlockOrder == "A12A34"){
          subblocks = [
            {subset: ['A1', 'A2'], targets: {'A1': nReps, 'A2': 0}},
            {subset: ['A3', 'A4'], targets: {'A3': nReps, 'A4': 0}}
          ];
        }
        else {
          subblocks = [
            {subset: ['A3', 'A4'], targets: {'A3': nReps, 'A4': 0}},
            {subset: ['A1', 'A2'], targets: {'A1': nReps, 'A2': 0}}
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
        number: 0,
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
