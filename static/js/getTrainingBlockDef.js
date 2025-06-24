const getTrainingBlockDef = function getTrainingBlockDef() {
  // Fixed reward probabilities for each action
  const fixedRewardProbs = { A1: 0.8, A2: 0.2, A3: 0.5, A4: 0.1 };

  // Latin square–based 8 sets of action–key mappings
  const actionKeyMappings = [
    { A1: "f", A2: "g", A3: "h", A4: "j" },
    { A1: "g", A2: "f", A3: "j", A4: "h" },
    { A1: "h", A2: "j", A3: "f", A4: "g" },
    { A1: "j", A2: "h", A3: "g", A4: "f" },
    { A1: "f", A2: "h", A3: "j", A4: "g" },
    { A1: "g", A2: "j", A3: "f", A4: "h" },
    { A1: "h", A2: "f", A3: "g", A4: "j" },
    { A1: "j", A2: "g", A3: "h", A4: "f" }
  ];

  // Generate two subblocks (each consisting of two actions) and assign target counts
  function createSubblocks(actions, conditionLabel) {
    const shuffled = jsPsych.randomization.shuffle(actions); // Shuffle the 4 actions
    const pair1 = [shuffled[0], shuffled[1]]; // First pair
    const pair2 = [shuffled[2], shuffled[3]]; // Second pair

    const pairOrder = jsPsych.randomization.shuffle([pair1, pair2]); // Shuffle the pair order

    return pairOrder.map(pair => {
      const targets = (conditionLabel === "Condition 1")
        ? generateTargetsForCondition1(pair, fixedRewardProbs) // Unequal target counts
        : { [pair[0]]: 20, [pair[1]]: 20 }; // Equal target counts

      return { subset: pair, targets };
    });
  }

  // For Condition 1: lower reward probability → more trials
  function generateTargetsForCondition1(subset, rewardProbs) {
    const sorted = [...subset].sort((a, b) => rewardProbs[a] - rewardProbs[b]); // Sort by reward prob
    return {
      [sorted[0]]: 24, // Action with lower reward gets more trials
      [sorted[1]]: 16  // Action with higher reward gets fewer trials
    };
  }

  // Build the full set of 8 training blocks
  function buildAllBlocks() {
    const blocks = [];

    for (let i = 0; i < 8; i++) {
      const isCond1 = i < 4; // First 4 are Condition 1, last 4 are Condition 2
      const condition = isCond1 ? "Condition 1" : "Condition 2";
      const keyMap = actionKeyMappings[i]; // Select corresponding action–key mapping

      const subblocks = createSubblocks(["A1", "A2", "A3", "A4"], condition);

      // 5 times forced choice for each action in this block
      const forcedTarget = {'A1':5, 'A2':5, 'A3':5, 'A4':5, };

      blocks.push({
        label: condition,
        rewardProbs: fixedRewardProbs,
        keyMapping: keyMap,
        subblocks: subblocks,
        forcedTarget: forcedTarget
      });
    }

    // Randomize the block order before returning
    return jsPsych.randomization.shuffle(blocks);
  }

  // Generate and return the 8 training blocks
  const allBlockDefs = buildAllBlocks();

  return allBlockDefs;
}
