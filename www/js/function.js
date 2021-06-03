let isEmail = email => {
    const regex = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
    return regex.test(email) && email.length <= 255;
}

let objectifyForm = input => {
    let retObject = {};
    input.each((index, element) => {
        const self = $(element);
        const key = self.attr('name');
        const val = self.val();
        retObject[key] = val;
    });
    return retObject;
}

let obj = {
    isEmpty(obejct = {}) {
        return Object.keys(obejct).length === 0;
    }
}

let href = href => {
    location.href = location.href + href;
}