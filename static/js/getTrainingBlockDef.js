// Use "Ctrl+ 'F'", search for "REPLACEME" in this file to customize your own block definitions
const getTrainingBlockDef = function getTrainingBlockDef() {
  // This function defines the structure of 8 training blocks used in the experiment.
  // Each block includes reward probabilities for four actions (A1–A4), a specific key mapping (from a Latin square),
  // and two subblocks that determine which pairs of actions are presented together. Condition 1 adjusts trial targets
  // based on reward probabilities (lower reward = more trials), while Condition 2 keeps targets equal.
  

  // REPLACEME:Fixed reward probabilities for each action 
  const fixedRewardProbs = { A1: 0.8, A2: 0.2, A3: 0.5, A4: 0.1 };

  // REPLACEME:Latin square–based 8 sets of action–key mappings
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

  // Create two subblocks from four actions; each subblock includes two actions and trial targets
  function createSubblocks(actions, conditionLabel) {
    const shuffled = jsPsych.randomization.shuffle(actions); // Shuffle the 4 actions
    const pair1 = [shuffled[0], shuffled[1]]; // First pair
    const pair2 = [shuffled[2], shuffled[3]]; // Second pair

    const pairOrder = jsPsych.randomization.shuffle([pair1, pair2]); // Shuffle the pair order

    return pairOrder.map(pair => {
      const targets = (conditionLabel === "Condition 1")
        ? generateTargetsForCondition1(pair, fixedRewardProbs) // Unequal target counts
        : { [pair[0]]: 20, [pair[1]]: 20 }; // REPLACEME:Equal target counts

      return { subset: pair, targets };
    });
  }

  // For Condition 1: assign more trials to lower reward-probability actions
  function generateTargetsForCondition1(subset, rewardProbs) {
    const sorted = [...subset].sort((a, b) => rewardProbs[a] - rewardProbs[b]); // Sort actions by reward probability
    return {
	  // REPLACEME
      [sorted[0]]: 24, // Lower-reward action gets 24 trials
      [sorted[1]]: 16  // Higher-reward action gets 16 trials
    };
  }

  // Construct all 8 training blocks
  function buildAllBlocks() {
    const blocks = [];

    for (let i = 0; i < actionKeyMappings.length; i++) {
      const isCond1 = i < actionKeyMappings.length/2; // First 4 blocks are Condition 1, next 4 are Condition 2
      const condition = isCond1 ? "Condition 1" : "Condition 2";
      const keyMap = actionKeyMappings[i]; // Choose corresponding action–key mapping

      const subblocks = createSubblocks(["A1", "A2", "A3", "A4"], condition);

      // REPLACEME:Fixed number of forced-choice trials for each action
      const forcedTarget = { 'A1': 5, 'A2': 5, 'A3': 5, 'A4': 5 };

      blocks.push({
        label: condition,
        rewardProbs: fixedRewardProbs,
        keyMapping: keyMap,
        subblocks: subblocks,
        forcedTarget: forcedTarget
      });
    }

    // Randomize the order of blocks before returning
    return jsPsych.randomization.shuffle(blocks);
  }

  // Return the full randomized block definition list
  const allBlockDefs = buildAllBlocks();
  return allBlockDefs;
}
