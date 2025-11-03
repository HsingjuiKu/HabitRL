function createTestPhase(vars, allTrainingBlocksDef) {
    const nTestReps = vars.n_test_reps;
    const nBlocks = vars.n_blocks;
    const setSize = vars.set_size;
    const imgs = Array.from({ length: nBlocks * setSize }, (_, i) => i + 1);
    const shuffledImgs = jsPsych.randomization.shuffle(imgs);
    const imgOrderTest = [].concat(...Array(nTestReps).fill(shuffledImgs));
    const actionCounts = { A1: 0, A2: 0, A3: 0 };
    const testTimeline = []
    let trialIdx = 0;
    testTimeline.push({
        timeline: [
            // Fixation cross
            {
                type: jsPsychHtmlKeyboardResponse,
    	  	    stimulus: () => generateStimulus(`static/images/fix_cross.jpg`, keys),
    	  	    choices: "NO_KEYS",
    	  	    trial_duration: 500
    	    },
            // Stimulus
    	    {
    	  	    type: jsPsychHtmlKeyboardResponse,
    	  	    stimulus: () => {
                    const img = imgOrderTest[trialIdx];
                    if (img == undefined) {
                        jsPsych.abortCurrentTimeline();
                        return '';
                    }
                    return generateStimulus(`static/images/${img}.jpg`, keys)
                },
    	  	    choices: keys,
    	  	    trial_duration: 2000,
    	  	    on_finish: d => {
                    const img = imgOrderTest[trialIdx];
                    const blockDef = allTrainingBlocksDef.find(def => Object.values(def.imgs).includes(img));
                    const imgIdx = Object.keys(blockDef.imgs).find(k => blockDef.imgs[k] === img);
                    const key = d.response;
                    const action = Object.entries(blockDef.keyMapping[imgIdx]).find(([k, v]) => v === key)?.[0];
                    d.phase = 'test';
                    d.block = null;
                    d.trial = trialIdx;
                    d.action = action;
                    d.a1_key = blockDef.keyMapping[imgIdx]['A1'];
                    d.a2_key = blockDef.keyMapping[imgIdx]['A2'];
                    d.a3_key = blockDef.keyMapping[imgIdx]['A3'];
                    d.reward_probs = blockDef.rewardProbs;
                    d.reward_values = blockDef.rewardValues;
                    d.reward_sd = blockDef.rewardSD;
                    d.condition = blockDef.condition;
                    d.a2_value = blockDef.rewardValues['A2'];
                    d.available_keys = keys;
                    d.available_actions = actions;
                    d.best_action = actions.sort()[0];
                    d.worst_action = actions.sort()[2];
                    d.best_action_chosen = d.best_action == action;
    	  	        d.image = img;
                    d.attention_check = null;
                    if (keys.includes(key)) {
                        d.valid = true;
                        actionCounts[action]++;
                    } else {
                        d.valid = false;
                        imgOrderTest.push(img);
                    }
                    d.aRewards = null;
                    d.keyRewards = null;
    	  	        d.reward = null;
                    d.s_count = null;
                    d.a1_count = actionCounts['A1'];
                    d.a2_count = actionCounts['A2'];
                    d.a3_count = actionCounts['A3'];
                    d.action_counts = JSON.parse(JSON.stringify(actionCounts));
    	  	    }
    	    },
            // Feedback
            {
                type: jsPsychHtmlKeyboardResponse,
                stimulus: () => {
                    const key = jsPsych.data.get().last(1).values()[0].response;
                    if (keys.includes(key)) {
                        return generateStimulus(`static/images/empty.jpg`, keys, rewards=null, selectedKey=key);
                    }
                    else {
                        return `<p style='color:red; font-size: 48px;'>Too slow!</p>`;
                    }
                },
                choices: "NO_KEYS",
                trial_duration: () => {
                    const action = jsPsych.data.get().last(1).values()[0].action;
                    if (typeof action === 'undefined') {
                      return 1000;
                    }
                    else {
                      return 1000;
                    }
                },
            },
        ],
        loop_function: () => {
            trialIdx++;

            if (Object.values(actionCounts).reduce((sum, val) => sum + val, 0) >= nBlocks * setSize * nTestReps) {
                return false;
            } else {
                return true;
            }
        }
    })
    return testTimeline;
};