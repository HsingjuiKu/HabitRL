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
    const imgIdx = imgOrder[trialIdx];
    const d = jsPsych.randomization.sampleWithoutReplacement(
        Array.from({length: 10}, (_, k) => k + 10), 1
    )[0];
    const Idx = (trialIdx + d) < imgOrder.length ? d : imgOrder.length;
    const imgOrderNew = [
        ...imgOrder.slice(0, Idx),
        imgIdx,
        ...imgOrder.slice(Idx, imgOrder.length)
    ];
    const subsetsNew = [
        ...subsets.slice(0, Idx),
        subsets[imgCounts[imgIdx]],
        ...subsets.slice(Idx, subsets.length)
    ];
    return [imgOrderNew, subsetsNew];
}