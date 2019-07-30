class TimeData {
    constructor(data) {
        this._data = data;
        this._beforeIndex = -1;
        this._ratio = null;
    }

    get before() {
        return this._data[this._beforeIndex];
    }

    get after() {
        return this._data[this._beforeIndex + 1];
    }

    get ratio() {
        return this._ratio;
    }

    seek(elapsedTime) {
        let left = 0;
        let right = this._data.length - 1;

        while (left <= right) {
            let mid = Math.floor((left + right) / 2);
            let data = this._data[mid];

            if (data.elapsedTime === elapsedTime) {
                this._beforeIndex = mid;
                this._ratio = 1;
                return;
            }

            if (data.elapsedTime < elapsedTime) {
                left = mid + 1;
            }
            else {
                right = mid - 1;
            }
        }

        this._beforeIndex = right;

        if (!this.before || !this.after) {
            this._ratio = NaN;
            return;
        }

        let difftime = this.after.elapsedTime - this.before.elapsedTime;
        this._ratio = (elapsedTime - this.before.elapsedTime) / difftime;
    }
}

export default TimeData;
