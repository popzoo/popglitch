// server.js
// where your node app starts
// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const request = require("request"); //down area already added this
const fs = require('fs');
const path = require('path');
// const fs = require('fs');//https
// const path = require('path');//https
// const https = require('https');//https
// const CryptoJS = require("crypto-js");
const fireCrawl = require("./routers/fireCrawl");
const sexyFox = require("./routers/sexyFox");//这是路由导入，非模块引用
const app = express();
app.use(express.static(path.join(__dirname, 'public'))); //指定静态网页目录,如图片、CSS、JavaScript
// app.use & app.all is different
// app.all('*', (req, res, next) => {//前端访问就跨域了，前端处理
//     if (req.get('X-Forwarded-Proto').indexOf("https") != -1) {
//         return next()
//     } else {
//         res.redirect('https://' + req.hostname + req.url);
//     }
// });
// app.use( (req, res, next) => {//强制https
//     if (!req.secure) {
//         return res.redirect('https://' + req.get('host') + req.url);
//     }
//     next();
// });
// console.info(__dirname);
fireCrawl();//调用firecrawl模块
app.use(sexyFox);//注意路由的写法和模块使用区别
// ====================================================================
// ========================= Origin Router ============================
// ====================================================================
app.all("/", (req, res) => {
    addApiHead(res, true, 3);
    return res.sendFile(__dirname + "/public/index.html");
});
app.get("/login", (req, res) => {
    addApiHead(res, true, 3);
    return res.sendFile(__dirname + "/public/login.html");
});
app.get("/register", (req, res) => {
    addApiHead(res, true, 3);
    return res.sendFile(__dirname + "/public/register.html");
});
app.get("/dream", (req, res) => {
    addApiHead(res, false, 1);
    let dreams = { code: 1, msg: "kiss your red face!" };
    return res.json(dreams);
});
app.all("/poetry", (req, res) => {
    addApiHead(res, false, 1);
    let dreams = {
        code: 1,
        msg: "江涵秋影枯万界,寒江孤舟驶星河!",
    };
    return res.json(dreams);
});
// ====================================================================
// ======================= Proxy subscription =========================
// ====================================================================
app.get("/netlifysub", function (req, res) {
    addApiHead(res, false, 2);
    console.info(req.url);
    var url = "https://jiang.netlify.app";
    return req.pipe(request(url)).pipe(res);
});
app.get("/ghsubfreev", function (req, res) {
    addApiHead(res, false, 2);
    console.info(req.url);
    var url = "https://raw.githubusercontent.com/freefq/free/master/v2";
    return req.pipe(request(url)).pipe(res);
});
app.get("/ghsubfrees", function (req, res) {
    addApiHead(res, false, 2);
    console.info(req.url);
    var url = "https://raw.githubusercontent.com/freefq/free/master/ssr";
    return req.pipe(request(url)).pipe(res);
});
app.get("/ghyusteven", function (req, res) {
    addApiHead(res, false, 2);
    console.info(req.url);
    var url = "https://raw.githubusercontent.com/git-yusteven/openit/main/long";
    return req.pipe(request(url)).pipe(res);
});
// eg: https://popzoo.glitch.me/initparam  (Proxy)   https://popbob.ml/initparam  (RailWay)  https://param.popzoo.ga/ (CF KV)
app.get("/initparam", function (req, res) {
    addApiHead(res, false, 1);
    console.info(req.url);
    var url = "https://raw.githubusercontent.com/popzoo/pop/master/json/paramConfig.json";
    return req.pipe(request(url)).pipe(res);
});
// app.get("/ladder", function (req, res) {
//     addApiHead(res,false, 2);
//     console.info(req.url);
//     var url = process.env.pipeUrl + '/getladder';
//     return req.pipe(request(url)).pipe(res);
// });
// app.get("/quantum", function (req, res) {
//     addApiHead(res,false, 2);
//     console.info(req.url);
//     var url = process.env.pipeUrl + '/getquantum';
//     return req.pipe(request(url)).pipe(res);
// });
// ====================================================================
// ======================== Live2d API Proxy ==========================
// ====================================================================
// url: '/666',
// baseUrl: '/live2d',
// originalUrl: '/live2d/666',
// params: {},
// query: {},
// eg: https://popzoo.glitch.me/live2d/font-awesome.min.css
app.use("/live2d", function (req, res) {
    addApiHead(res, true, 2);
    // console.info(req.url);
    var url = "https://cdn.jsdelivr.net/gh/popsee/live2d-all" + req.url;//这里中间不要多加/
    console.info(url);
    return req.pipe(request(url)).pipe(res);
});
app.use("/fonts", function (req, res) {
    addApiHead(res, true, 2);
    // console.info(req.url);
    var url = "https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/fonts" + req.url;//这里中间不要多加/
    console.info(url);
    return req.pipe(request(url)).pipe(res);
});
// ====================================================================
// =========================== Github Proxy ===========================
// ====================================================================
// eg: https://popzoo.glitch.me/raw/popsee/live2d-all/main/live2d.min.js
// eg: https://popzoo.glitch.me/raw/popzoo/pop/master/json/paramConfig.json
app.use("/raw", function (req, res) {
    addApiHead(res, false, 2);
    // console.info(req.url);
    var url = "https://raw.githubusercontent.com" + req.url;
    console.info(url);
    return req.pipe(request(url)).pipe(res);
});
// eg https://popzoo.glitch.me/gh/popsee/live2d-all/live2d.min.js
app.use("/gh", function (req, res) {
    addApiHead(res, false, 2);
    // console.info(req.url);
    var url = "https://cdn.jsdelivr.net/gh" + req.url;
    console.info(url);
    return req.pipe(request(url)).pipe(res);
});
// eg: https://popzoo.glitch.me/cdn/npm/font-awesome@4.7.0/css/font-awesome.css
app.use("/npm", function (req, res) {
    addApiHead(res, false, 2);
    // console.info(req.url);
    var url = "https://cdn.jsdelivr.net/npm" + req.url;
    console.info(url);
    return req.pipe(request(url)).pipe(res);
});
// ====================================================================
// ===================== Response Header Config =======================
// ====================================================================
app.all('*', (req, res) => {
    res.header("Cache-Control", "max-age=3600"); //缓存的内容将在1800秒后失效（单位是秒）
    return res.sendFile(__dirname + '/public/404.html');
});
//返回json数据时加此头部,node原生的res.setHeader()仅允许您设置单个标头，而express框架的res.header()仅允许您设置多个标头
function addApiHead(res, isCached, ctype) {
    if (ctype == 1) {
        res.header("Content-Type", "application/json;charset=utf-8");
    } else if (ctype == 2) {
        res.header("Content-Type", "text/plain;charset=utf-8");
    } else if (ctype == 3) {
        res.header("Content-Type", "text/html;charset=utf-8");
    }
    // 支持跨域
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Authorization, Accept, X-Requested-With"
    );
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
    res.header("X-Powered-By", "nodejs"); //自定义头信息，表示服务端用nodejs
    // 控制缓存
    if (isCached) {
        res.header("Cache-Control", "max-age=1800"); //缓存的内容将在1800秒后失效（单位是秒）
        res.header("Expires", 1800); //效果同上，优先级弱于max-age,如上者存在，则被覆盖           
    } else {
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.header("Pragma", "no-cache");
        res.header("Expires", 0);
    }
}

// listen for requests ,端口必须用3000，否则外部请求无法映射到内部服务器
const listener = app.listen(process.env.PORT || 80, () => {//==================3000
    console.debug("app is listening on port " + listener.address().port);
});
// ==============================================================
// ==============================================================
// ==============================================================
//此处为强制https
// function requireHTTPS(req, res, next) {
//     if (!req.secure) {
//         return res.redirect('https://' + req.get('host') + req.url);
//     }
//     next();
// }
// app.use(requireHTTPS);
// app.use( (req, res, next) => {//use为模糊匹配路由，需要前置
//     if (!req.secure) {
//         return res.redirect('https://' + req.get('host') + req.url);
//     }
//     next();
// });
