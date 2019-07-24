function calcRatio(before, after, time) {
    if (!before || !after) return NaN;
    if (before.elapsedTime === after.elapsedTime) return .5;

    let difftime = after.elapsedTime - before.elapsedTime;
    return (after.elapsedTime - time) / difftime;
}

function calcValueRatio(a, b, ratio) {
    return a * ratio + b * (1 - ratio);
}

function calcPointRatio(a, b, ratio) {
    return {
        x: calcValueRatio(a.x, b.x, ratio),
        y: calcValueRatio(a.y, b.y, ratio),
    };
}

function findCurrentState(array, time, left, right) {
    if (left === undefined) {
        left = 0;
    }

    if (right === undefined) {
        right = array.length - 1;
    }

    while (left <= right) {
        let mid = Math.floor((left + right) / 2);

        if (array[mid].elapsedTime === time) {
            return {
                before: array[mid],
                after: array[mid + 1],
                beforeIndex: mid,
                afterIndex: mid + 1,
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

    let beforeIndex = right;
    let afterIndex = left;
    let before = array[right];
    let after = array[left];

    let ratio = calcRatio(before, after, time);
    return { before, after, ratio, beforeIndex, afterIndex };
}


export { calcRatio, calcValueRatio, calcPointRatio, findCurrentState };
