// mysqli
const mysql = require('mysql');
const { json } = require('body-parser');
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

let insert = sql => { // 新增
    return new Promise((resolve, reject) => {
        db.insert
        db.query(sql, (err, res) => {
            if (err) reject(err);
            else resolve(res);
        })
    })
}

let exist = (sql, errorText, isThrew = true) => { // 檢查是否存在此資料 errorText = 錯誤回傳訊息
    return new Promise((resolve, reject) => {
        db.query(sql, (err, res) => {
            if (res.length) {
                if (isThrew) reject(JSON.stringify(errorText));
                else resolve(true);
            } else resolve(false);
        })
    })
}

module.exports = { query, exist };