function replace(obj, change = /\s+/g, into = '') { // 消除空白
    for (const key in obj) {
        let val = obj[key];
        obj[key] = val.replace(change, into);
    }
}

function haveKeys(obj = {}, keys = [], allowValueEmpty = false) { // 檢查是否包含 keys
    let ret = true;
    keys.forEach(key => {
        if (!ret) return;
        if (!allowValueEmpty) {
            const val = obj[key];
            ret = val !== '';
        }
        ret = obj.hasOwnProperty(key);
    });
    return ret;
}

module.exports = { replace, haveKeys };