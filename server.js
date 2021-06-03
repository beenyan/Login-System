'use strict';
const express = require('express');
const bp = require('body-parser'); // Post
const ejs = require('ejs');
const session = require('express-session');
const obj = require('./configs/object.js');
const msl = require('./configs/mysqli.js');
const bcrypt = require('bcrypt'); // 密碼加密
const { check, validationResult } = require('express-validator'); // 資料驗證

const app = express();
const Port = 80;
app.set('views', __dirname + '/www');
app.engine('html', ejs.renderFile); // 解析 HTML
app.set('view engine', 'html'); // 解析 HTML
app.use(bp.json()); // 解析 POST
app.use(bp.urlencoded({ extended: true })); // 解析 POST
app.use('/css', express.static(__dirname + '/www/css')); // 靜態取得 (css)
app.use('/js', express.static(__dirname + '/www/js')); // 靜態取得 (js)
app.use(session({ // 設定 session
    secret: 'keyboard cat', // 伺服器認證名字 (隨意)
    name: 'sessionID', // 使用者的 ID
    resave: false, // session 沒有變化是否保存
    saveUninitialized: true, // 未設定 session 名子也儲存
    cookie: {
        // secure: true, // 僅限 https 使用
        // maxAge: 100 * 1000, // 過期時間
    },
}))

app.get('/backdoor', (req, res) => { // 後門
    req.session.user = {
        name: '後門使用者',
        account: '後門使用者',
        password: '後門使用者',
        email: 'backdoor@backdoor.com',
        id: -1,
        rank: 2
    }
    res.redirect('/');
})

app.get('/', (req, res) => {
    req.session.user = {
        name: '後門使用者',
        account: '後門使用者',
        password: '後門使用者',
        email: 'backdoor@backdoor.com',
        id: -1,
        rank: 2
    }
    const user = req.session.user;
    if (user) {
        res.render('lobby', user);
    } else {
        res.render('index');
    }
});

app.post('/login',
    check('account')
        .isLength({ min: 5, max: 45 })
        .withMessage({ account: '字數5~45' })
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage({ account: '只允許a-z、A-Z、0-9、_-' }),
    check('password')
        .isLength({ min: 8 })
        .withMessage({ password: '至少八個字元' })
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,60}$/)
        .withMessage({ password: '至少一個字母和一個數字' }),
    async (req, res) => { // 登入
        let errObject = { error: {} };
        const checkError = validationResult(req).errors;
        if (checkError.length) {
            checkError.forEach(error => errObject.error = Object.assign(errObject.error, error.msg));
            res.json(errObject);
            return;
        }

        const post = req.body;
        const account = `SELECT * FROM nodejs.user as user WHERE account LIKE '${post.account}'`;
        let userData = await msl.query(account);
        if (userData.length) {
            userData = userData[0];
            if (bcrypt.compareSync(post.password, userData.password)) {
                req.session.user = userData; // 密碼正確
                msl.loginIP(req); // 紀錄登入IP
            }
            else errObject.error.password = '密碼錯誤';
        } else errObject.error.account = '帳號錯誤'

        res.json(errObject);
    });

app.post('/register',
    check('name')
        .isLength({ min: 3, max: 25 })
        .withMessage({ name: '字數3~25' })
        .matches(/^[\u4e00-\u9fa5a-zA-Z0-9_-]+$/)
        .withMessage({ name: '只允許中文、a-z、A-Z、0-9、_-' }),
    check('account')
        .isLength({ min: 5, max: 255 })
        .withMessage({ account: '字數5~255' })
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage({ account: '只允許a-z、A-Z、0-9、_-' }),
    check('password')
        .isLength({ min: 8 })
        .withMessage({ password: '至少八個字元' })
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,60}$/)
        .withMessage({ password: '至少一個字母和一個數字' }),
    check('email')
        .isEmail()
        .withMessage({ email: '信箱格式錯誤' }),
    async (req, res) => { // 註冊
        let errObject = { error: {} };
        const checkError = validationResult(req).errors;
        if (checkError.length) {
            checkError.forEach(error => errObject.error = Object.assign(errObject.error, error.msg));
            res.json(errObject);
            return;
        }

        let post = req.body;
        const head = 'SELECT * FROM nodejs.user as user WHERE';
        const account = `${head} account LIKE '${post.account}'`; // 帳號查詢
        const email = `${head} email LIKE '${post.email}'`; // 信箱重複
        // 檢查重複
        try {
            if (await msl.exist(account, true))
                errObject.error.account = '帳號重複';
            if (await msl.exist(email, true))
                errObject.error.email = '信箱重複';
            if (obj.isEmpty(errObject.error)) { // 創建使用者
                const saltRounds = 10;
                post.password = bcrypt.hashSync(post.password, saltRounds); // 加密
                post.creat_time = +new Date(); // 帳號創建時間
                await msl.insert('INSERT INTO nodejs.user', post); // 新增
                // 登入
                let userData = await msl.query(`SELECT * FROM nodejs.user as user WHERE account LIKE '${post.account}'`);
                userData = userData[0];
                req.session.user = userData;
                msl.loginIP(req); // 紀錄登入IP
            }
        } catch (error) {
            console.log(error);
            errObject.error.msg = '未知錯誤';
        }
        res.json(errObject);
    });

app.get('/gameList', (req, res) => { // 取得遊戲列表
    if (!req.session.user) { // 登入檢查
        res.redirect('/');
        return;
    }
    res.render('gameList');
})

let Rooms = {

};

app.get('/gameList/NS-SHAFT', (req, res) => { // 小朋友下樓梯
    if (!req.session.user) { // 登入檢查
        res.redirect('/');
        return;
    }
    res.render('NS-SHAFT/index');
});

app.use((req, res) => res.status(404).render('404')); // 網址錯誤

app.listen(Port);