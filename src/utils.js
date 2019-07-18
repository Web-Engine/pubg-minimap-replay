function binarySearch(array, value) {
    let left = 0;
    let right = array.length;

    while (left <= right) {
        let mid = Math.floor((left + right) / 2);

        if (array[mid] === value) {
            return mid;
        }

        if (array[mid] <= value) {
            left = mid + 1;
        }
        else {
            right = mid - 1;
        }
    }

    return right;
}

export { binarySearch };
