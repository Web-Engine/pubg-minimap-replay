function calcValueRatio(a, b, ratio) {
    return a * ratio + b * (1 - ratio);
}

function calcPointRatio(a, b, ratio) {
    return {
        x: calcValueRatio(a.x, b.x, ratio),
        y: calcValueRatio(a.y, b.y, ratio),
    };
}

function findCurrentState(array, time) {
    let left = 0;
    let right = array.length - 1;

    while (left <= right) {
        let mid = Math.floor((left + right) / 2);

        if (array[mid].elapsedTime === time) {
            return {
                before: array[mid],
                after: array[mid + 1],
                ratio: 1,
            };
        }

        if (array[mid].elapsedTime < time) {
            left = mid + 1;
        }
        else {
            right = mid - 1;
        }
    }

    let before = array[right];
    let after = array[left];

    if (!before || !after) {
        return { before, after, ratio: NaN };
    }

    let difftime = after.elapsedTime - before.elapsedTime;
    let ratio = (after.elapsedTime - time) / difftime;

    return { before, after, ratio };
}


export { calcValueRatio, calcPointRatio, findCurrentState };
