class BaseClass {
    constructor() {

    }
    static new(...args) {
        return new this(...args)
    }
}

module.exports = BaseClass