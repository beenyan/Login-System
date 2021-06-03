// mysqli
const mysql = require('mysql');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'nodejs',
    port: '3306'
});

db.connect();

let query = sql => { // 查詢
    return new Promise((resolve, reject) => {
        db.query(sql, (err, res) => {
            if (err) reject(err);
            else resolve(res);
        })
    })
}

let insert = (sql, key, val = key) => { // 新增
    const keys = Object.keys(key).join(',');
    const vals = Object.values(key).join("','");
    const insert = `${sql} (${keys}) VALUES ('${vals}')`;
    return new Promise((resolve, reject) => {
        db.query(insert, (err, res) => {
            if (err) reject(err);
            else resolve(res);
        })
    })
}

let exist = (sql, errorText) => { // 檢查是否存在此資料 errorText = 錯誤回傳訊息
    return new Promise((resolve, reject) => {
        db.query(sql, (err, res) => {
            if (err) reject(err);
            else resolve(res.length);
        });
    })
}


let loginIP = req => {
    const login_data = {
        user_ip: req.ip,
        user_id: req.session.user.id,
        time: +new Date(), // 登入時間
    }
    insert('INSERT INTO nodejs.`login-log`', login_data); // 新增
}
module.exports = { query, insert, exist, loginIP };