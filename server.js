// server.js
// where your node app starts
// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const request = require("request"); //down area already added this
// const CryptoJS = require("crypto-js");
var fireCrawl = require("./fireCrawl");
const app = express();
fireCrawl();//调用firecrawl模块
app.use(express.static("public"));
// app.use & app.all is different
// app.all('*', (req, res, next) => {//前端访问就跨域了，前端处理
//     if (req.get('X-Forwarded-Proto').indexOf("https") != -1) {
//         return next()
//     } else {
//         res.redirect('https://' + req.hostname + req.url);
//     }
// });
app.all("/", (req, res) => {
    addApiHead(res, true, 3);
    return res.sendFile(__dirname + "/index.html");
});
app.get("/login", (req, res) => {
    addApiHead(res, true, 3);
    return res.sendFile(__dirname + "/views/login.html");
});
// send the default array of dreams to the webpage
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
app.use("/initparam", function (req, res) {
    addApiHead(res, false, 1);
    console.info(req.url);
    var url =
        "https://raw.githubusercontent.com/popzoo/pop/master/json/paramConfig.json";
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
// ========================================================================
// ========================================================================
// ========================================================================
const CryptoJS = require("crypto-js");
const jwtToken = process.env.jwtToken;
const xnmHostUrl = 'https://' + process.env.xnmHost + '/OpenAPI/v1';
const header = {
    'Host': process.env.xnmHost,
    'Connection': 'close',
    'authorization': 'Bearer ' + jwtToken,
    'Accept-Encoding': 'gzip, deflate',
    'User-Agent': 'okhttp/4.8.0',
    'X-Live-Butter2': '4L0HHMyx728WLb9kOmYL2tteICKUYcihkkrtgjObLBBlD/8AK2BMvwX35PL5hlVAl2EbXpF3nqADhJB0jWrClxqZ1c2Ze2DDNIop2Q/x4GfOSdTdjg5zmkfS6x51VsEUQmGDuocccoFQT6ZziFmZp/fBMaJK1whD/jG5733f0VGlk6YCuAPYB9/sBlqI7CsC',
    'X-Accept-Puzzle': 'cola,tiger,tiger2,panda',
    'knockknock': 'synergy',
    'X-Live-Pretty': 'spring',
}
// # 获取apk版本号码
app.use("/api/appver", (req, res) => {
    addApiHead(res, false, 1);
    let requrl = xnmHostUrl + '/config/getliteversion';
    request({
        url: requrl,
        method: "GET",
        json: true,
        gzip: true,
        headers: header
    }, function (error, response, body) {
        if (!error && response.statusCode < 400) {
            // console.info(body);
            return res.json(body);
        } else {
            console.error("Request Exception!", error);
            return res.status(404).json([]);
        }
    })
});
//  # 获取配置静态域名
app.use("/api/appconf", (req, res) => {
    addApiHead(res, false, 1);
    let requrl = xnmHostUrl + '/config/getappconfig';// ?platform=ios
    request({
        url: requrl,
        method: "GET",
        json: true,
        gzip: true,
        headers: header
    }, function (error, response, body) {
        if (!error && response.statusCode < 400) {
            // console.info(body);
            return res.json(body);
        } else {
            console.error("Request Exception!", error);
            return res.status(404).json([]);
        }
    })
});
// # 获取最热列表  >100
app.use("/api/hot", (req, res) => {
    addApiHead(res, false, 1);
    let page = req.query.page != null ? req.query.page : 1;
    let requrl = xnmHostUrl + '/anchor/hot?page=' + page + '&size=100&order=time';
    request({
        url: requrl,
        method: "GET",
        json: true,
        gzip: true,
        headers: header
    }, function (error, response, body) {
        if (!error && response.statusCode < 400) {
            if (body.code == 0) {
                // console.info(body);
                let anchorList = body.data.list;
                // console.info(anchorList.length);
                return res.json(body.data);
            } else {
                return res.status(404).json([]);
            }
        } else {
            console.error("Request Exception!", error || body);
            return res.status(404).json([]);
        }
    })
});
// # 获取最新列表  <10
app.use("/api/latest", (req, res) => {
    addApiHead(res, false, 1);
    let requrl = xnmHostUrl + '/anchor/latest?page=1&size=50&order=time';
    request({
        url: requrl,
        method: "GET",
        json: true,
        gzip: true,
        headers: header
    }, function (error, response, body) {
        if (!error && response.statusCode < 400) {
            // console.info(body);
            if (body.code == 0) {
                let anchorList = body.data.list;
                // console.info(anchorList.length);
                return res.json(body.data);
            } else {
                return res.status(404).json([]);
            }
        } else {
            console.error("Request Exception!", error || body);
            return res.status(404).json([]);
        }
    })
});
// # 获取附近列表
app.use("/api/nearby", (req, res) => {
    addApiHead(res, false, 1);
    let page = req.query.page != null ? req.query.page : 1;
    let requrl = xnmHostUrl + '/anchor/nearby?page=' + page + '&size=50&order=time';
    request({
        url: requrl,
        method: "GET",
        json: true,
        gzip: true,
        headers: header
    }, function (error, response, body) {
        if (!error && response.statusCode < 400) {
            if (body.code == 0) {
                // console.info(body);
                let anchorList = body.data.list;
                // console.info(anchorList.length);
                return res.json(body.data);
            } else {
                return res.status(404).json([]);
            }
        } else {
            console.error("Request Exception!", error || body);
            return res.status(404).json([]);
        }
    })
});
// # 获取颜值列表
app.use("/api/vegan", (req, res) => {
    addApiHead(res, false, 1);
    let requrl = xnmHostUrl + '/anchor/vegan?page=1&size=100&order=time';//isPk=0
    request({
        url: requrl,
        method: "GET",
        json: true,
        gzip: true,
        headers: header
    }, function (error, response, body) {
        if (!error && response.statusCode < 400 && body != undefined) {
            if (body.code == 0) {
                // console.info(body);
                let anchorList = body.data.list;
                // console.info(anchorList.length);
                return res.json(body.data);
            } else {
                return res.status(404).json([]);
            }
        } else {
            console.error("Request Exception!", error || body);
            return res.status(404).json([]);
        }
    })
});
// # 获取颜值列表
app.use("/api/vip", (req, res) => {
    addApiHead(res, false, 1);
    let requrl = xnmHostUrl + '/anchor/vip?page=1&size=50&order=time';
    request({
        url: requrl,
        method: "GET",
        json: true,
        gzip: true,
        headers: header
    }, function (error, response, body) {
        if (!error && response.statusCode < 400 && body != undefined) {
            if (body.code == 0) {
                // console.info(body);
                let anchorList = body.data.list;
                // console.info(anchorList.length);
                return res.json(body.data);
            } else {
                return res.status(404).json([]);
            }
        } else {
            console.error("Request Exception!", error || body);
            return res.status(404).json([]);
        }
    })
});
// # 返回房间的html文件
app.use("/room", (req, res) => {//use为模糊匹配路由
    addApiHead(res, true, 3);
    return res.sendFile(__dirname + "/public/detail.html");
});
// # 获取rtmp加密数据
app.use("/api/stream", (req, res) => {
    addApiHead(res, false, 1);
    let requrl = xnmHostUrl + '/private/getPrivateLimit';
    request({
        url: requrl + '?uid=' + req.query.uid,
        method: "GET",
        json: true,
        gzip: true,
        headers: header
    }, function (error, response, body) {
        if (!error && response.statusCode < 400) {
            var decodeData = decryptProcess(body);// console.info(decodeData);
            try {
                var jsonData = JSON.parse(decodeData);
                return res.json(jsonData);
            } catch (e) {
                console.error("Json Parse Error!", e);
                return res.status(403).json([]);
            }
        } else {
            console.error("Request Exception!", error || body);
            return res.status(404).json([]);
        }
    })
});
function decryptProcess(data) {
    let md5Key = CryptoJS.MD5(jwtToken);
    let smd5Key = md5Key.toString();
    // console.log("md5Key = %s", md5Key.toString());
    var key = CryptoJS.enc.Utf8.parse(smd5Key.substring(0, 16));
    // console.log("key = %s", key.toString(CryptoJS.enc.Hex));
    var iv = CryptoJS.enc.Utf8.parse(smd5Key.substring(16));
    // console.log("iv = %s", iv.toString(CryptoJS.enc.Hex));
    return CryptoJS.AES.decrypt(data, key, { iv: iv, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
}
// ========================================================================
// ========================================================================
// ========================================================================
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
const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
});


