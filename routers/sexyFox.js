const request = require("request");
const CryptoJS = require("crypto-js");
const express = require('express');
const path = require('path');
const router = express.Router();
const JWTokenArr = ['eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJzdWIiOiI5NjI2MzQ1OCIsInVzZXJuYW1lIjoiKzEyMTYzMDc4Nzk0Iiwicm9sZSI6MCwibG9iIjoxLCJpYXQiOjE2NDU4NDAwODEsImV4cCI6MTY0ODQzMjA4MX0.XX7JqojSM4c_yWdonBlMAmvy6SAZZPE6S63csfeZVUp4kbS9YbM-dSdOF0qcFypm4uE4yJbeEqfNYGo8ZUTsFw', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJzdWIiOiIyOTI5MDc5OCIsInVzZXJuYW1lIjoiKzQ0NzQ4MDcyODI5MCIsInJvbGUiOjAsImxvYiI6MSwiaWF0IjoxNjQ1ODQ0MzI5LCJleHAiOjE2NDg0MzYzMjl9.rNrd6OI-slTgeBIEHkyKz7mJ7NnMj86Q6xq67xTcyX1XcweS55xdm-pqyy2qy7MaPey_s78dPztSj8adBbwWGw'];
// const jwtToken = JWTokenArr[0];
const foxHostArr = ['lvsfbqec.shdkw1o.com', 'cywqfzo8.shdkw1o.com'];//android,web,ios ,'0djxrjui.shdkw1o.com'
const foxHost = foxHostArr[parseInt(Math.random() * foxHostArr.length)];
const foxHostUrl = 'https://' + foxHost + '/OpenAPI/v1';
const header = {
    'Host': foxHost,
    'Connection': 'close',
    'authorization': 'Bearer ' + JWTokenArr[0],
    'Accept-Encoding': 'gzip, deflate',
    'User-Agent': 'okhttp/4.8.0',
    'X-Live-Butter2': '4L0HHMyx728WLb9kOmYL2tteICKUYcihkkrtgjObLBBlD/8AK2BMvwX35PL5hlVAl2EbXpF3nqADhJB0jWrClxqZ1c2Ze2DDNIop2Q/x4GfOSdTdjg5zmkfS6x51VsEUQmGDuocccoFQT6ZziFmZp/fBMaJK1whD/jG5733f0VGlk6YCuAPYB9/sBlqI7CsC',
    'X-Accept-Puzzle': 'cola,tiger,tiger2,panda',
    'knockknock': 'synergy',
    'X-Live-Pretty': 'spring'
}
// # 获取apk版本号码
router.get("/api/appver", (req, res) => {
    addApiHead(res, false, 1);
    let requrl = foxHostUrl + '/config/getliteversion';
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
router.get("/api/appconf", (req, res) => {
    addApiHead(res, false, 1);
    let requrl = foxHostUrl + '/config/getappconfig';// ?platform=ios
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
router.get("/api/hot", (req, res) => {
    addApiHead(res, false, 1);
    let page = req.query.page != null ? req.query.page : 1;
    // let requrl = foxHostUrl + '/anchor/hot?page=' + page + '&size=100&order=time';
    let requrl = foxHostUrl + '/anchor/hot?page=' + page + '&size=50';
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
                // let anchorList = body.data.list;
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
router.get("/api/nearby", (req, res) => {
    addApiHead(res, false, 1);
    let page = req.query.page != null ? req.query.page : 1;
    let requrl = foxHostUrl + '/anchor/nearby?page=' + page + '&size=50';
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
                // let anchorList = body.data.list;
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
// # 获取颜值列表 <100
router.get("/api/vegan", (req, res) => {
    addApiHead(res, false, 1);
    let page = req.query.page != null ? req.query.page : 1;
    let requrl = foxHostUrl + '/anchor/vegan?page=' + page + '&size=50';//isPk=0
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
                // let anchorList = body.data.list;
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
// # 获取贵宾房列表 <50
router.get("/api/vip", (req, res) => {
    addApiHead(res, false, 1);
    let page = req.query.page != null ? req.query.page : 1;
    let requrl = foxHostUrl + '/anchor/vip?page=' + page + '&size=50';
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
                // let anchorList = body.data.list;
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
// # 获取最新列表  =1
router.get("/api/latest", (req, res) => {
    addApiHead(res, false, 1);
    let requrl = foxHostUrl + '/anchor/latest?page=1&size=50';//&order=time
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
                // let anchorList = body.data.list;
                // console.info(anchorList.length);
                return res.json(body.data);
            } else {
                return res.status(404).json([]);
            }
        } else {
            console.error("Request Exception!", error || body);
            if (body != undefined && response.statusCode == 401 && body.code == 401) {
                return res.status(401).json(body);
            } else {
                return res.status(404).json(error || body);
            }
        }
    })
});
// # 返回房间的html文件
router.use("/room", (req, res) => {//use为模糊匹配路由
    addApiHead(res, true, 3);
    return res.sendFile(path.join(__dirname, '../public/foxin.html'));//注意路径
});
// # 获取rtmp加密数据
router.get("/api/stream", (req, res) => {
    addApiHead(res, false, 1);
    let requrl = foxHostUrl + '/private/getPrivateLimit';
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
    let md5Key = CryptoJS.MD5(JWTokenArr[0]);
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
module.exports = router;
