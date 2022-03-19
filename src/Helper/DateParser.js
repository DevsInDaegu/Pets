export default class DateParser {
    isValid
    get date() {
        if(this.isValid) {
            return this.parsedDate
        }else {
            throw "Invalid date"
        }
    }

    constructor(string) {

        if (!/^(\d){8}$/.test(string)) {
            this.isValid = false
            return
        }
        var y = string.substr(0, 4),
            m = string.substr(4, 2),
            d = string.substr(6, 2);
        this.isValid = true
        this.parsedDate = new Date(y, m, d);
    }
}