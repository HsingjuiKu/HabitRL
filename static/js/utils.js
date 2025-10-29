function shuffleSubsets(blockDef) {
    let subsets = [];
    const nChunks = blockDef.nReps / 2;
    for (let i = 0; i < nChunks; i++) {
        subsets.push(...jsPsych.randomization.shuffle([
            ...Array(blockDef.nActionTargets['A1'] / nChunks * 0).fill(['A1', 'A3']),
            ...Array(blockDef.nActionTargets['A1'] / nChunks * 1).fill(['A1', 'A2']),
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

function changeTrial(imgOrder, trialIdx, imgCounts, subsets) {
    const imgIdx = imgOrder[trialIdx];
    const subsetIdx = imgCounts[imgIdx];
    const nextIdx = subsets[imgIdx].slice(subsetIdx + 1).findIndex(  // check for the next [A2, A3] trial
        el => el.includes('A2') && el.includes('A3')
    );
    const matchSubsetIdx = nextIdx !== -1 ? subsetIdx + 1 + nextIdx : undefined;

    // If a [A2, A3] trial exists, replace it with [A1, A3]
    if (matchSubsetIdx) {
        subsets[imgIdx][matchSubsetIdx] = ['A1', 'A3'];
    } else {  // if not, simply append two new [A1, A3] trials (keeping A1/A2 executions equal)
        imgOrder.splice(trialIdx + 1, 0, imgIdx);
        subsets[imgIdx].splice(subsetIdx + 1, 0, ['A1', 'A3']);
        imgOrder.push(imgIdx);
        subsets[imgIdx].push(['A1', 'A3']);
    }
    return [imgOrder, subsets];
}