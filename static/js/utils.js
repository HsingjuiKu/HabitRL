function shuffleSubsets(blockDef) {
    let subsets = [];
    const nChunks = blockDef.nReps / 2;
    for (let i = 0; i < nChunks; i++) {
        subsets.push(...jsPsych.randomization.shuffle([
            ...Array(blockDef.nActionTargets['A1'] / nChunks * .5).fill(['A1', 'A3']),
            ...Array(blockDef.nActionTargets['A1'] / nChunks * .5).fill(['A1', 'A2']),
            ...Array(blockDef.nActionTargets['A2'] / nChunks).fill(['A2', 'A3'])
        ]));
    }
    return subsets;
}

function shuffleImgOrder(blockDef) {
    let imgOrder = [];
    const nTrials = Object.values(blockDef.nActionTargets).reduce((sum, count) => sum + count, 0);
    const nChunks = nTrials / 2;
    for (let i = 0; i < nChunks; i++) {
        const nums = Array.from({length: blockDef.setSize}, (_, k) => k).flatMap(k => [k, k]);
        imgOrder.push(...jsPsych.randomization.shuffle(nums));
    }
    return imgOrder;
}

function repeatTrial(imgOrder, trialIdx, imgCounts, subsets) {
    // Add trial to imgOrder
    const imgId = imgOrder[trialIdx];
    const idxRange = Array.from({length: imgOrder.length - (trialIdx + 5) + 1}, (_, i) => trialIdx + 5 + i);
    let newIdx = idxRange[Math.floor(Math.random() * idxRange.length)];
    if (newIdx == undefined) {  // if there are not enough trials
        newIdx = imgOrder.length;  // append to end
    }
    imgOrder.splice(newIdx, 0, imgId);

    // Add corresponding trial to subsets
    const subsetIdx = imgCounts[imgId];
    const subset = subsets[imgId][subsetIdx];
    const nJumped = imgOrder.slice(trialIdx + 1, newIdx).filter(id => id === imgId).length;
    const newSubsetIdx = subsetIdx + nJumped + 1;
    subsets[imgId].splice(newSubsetIdx, 0, subset);

    return [imgOrder, subsets];
}

function changeTrial(imgOrder, trialIdx, imgCounts, subsets) {
    const imgId = imgOrder[trialIdx];
    const subsetIdx = imgCounts[imgId];
    let matchSubsetIndices = subsets[imgId].map((el, idx) => 
        el.includes('A2') && el.includes('A3') ? idx : -1
    ).filter(idx => idx !== -1);
    matchSubsetIndices = matchSubsetIndices.filter(idx => idx > subsetIdx);
    let matchSubsetIdx = null
    if (matchSubsetIndices.length > 0) {
        matchSubsetIdx = matchSubsetIndices[Math.floor(Math.random() * matchSubsetIndices.length)];
    }

    // If a [A2, A3] trial exists, replace it with [A1, A3]
    if (matchSubsetIdx !== null) {
        subsets[imgId][matchSubsetIdx] = ['A1', 'A3'];
    } else {  // if not, append two new [A1, A3] trials (keeping A1/A2 executions equal)
        for (let i=0; i<2; i++) {
            // Add trial to imgOrder
            const idxRange = Array.from({length: imgOrder.length - (trialIdx + 2) + 1}, (_, i) => trialIdx + 2 + i);
            let newIdx = idxRange[Math.floor(Math.random() * idxRange.length)];
            if (newIdx == undefined) {  // if there are not enough trials
                newIdx = imgOrder.length;  // append to end
            }
            imgOrder.splice(newIdx, 0, imgId);

            // Add corresponding trial to subsets
            const nJumped = imgOrder.slice(trialIdx + 1, newIdx).filter(id => id === imgId).length;
            const newSubsetIdx = subsetIdx + nJumped + 1;
            subsets[imgId].splice(newSubsetIdx, 0, ['A1', 'A3']);
        }
    }
    return [imgOrder, subsets];
}