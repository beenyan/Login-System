function replace(object, change = /\s+/g, into = '') { // 消除空白
    for (const key in object) {
        let val = object[key];
        object[key] = val.replace(change, into);
    }
}

function isEmpty(object = {}) {
    return Object.keys(object).length === 0;
}

module.exports = { replace, isEmpty };