// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();

app.use(express.static("public"));
app.get("/", (request, response) => {//https://firepage.glitch.me/
    response.sendFile(__dirname + "/views/index.html");
});
app.get("/login", (request, response) => {//https://firepage.glitch.me/
    response.sendFile(__dirname + "/views/login.html");
});
// send the default array of dreams to the webpage
app.get("/dreams", (request, response) => {
    addApiHead(response);
    // response.json(dreams);
    let dreams = {code:1,msg:getTimeInfo()+"kiss your vagina"};
    response.json(dreams);
    // response.send(JSON.stringify(dreams));
});

// listen for requests :)
const listener = app.listen(process.env.PORT||3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
});

// ========================================================================
// ========================================================================
// ========================================================================
// npm install crypto
// npm install ws
// npm install request
// ============非必须===============
// npm install node-schedule
// npm i cos-nodejs-sdk-v5
// npm install -g cnpm  淘宝npm镜像
// npm install -g nexe
// nexe fireCrawl.js -o fireBump.exe
// =================================
// const schedule = require('node-schedule');
// const FormData = require('form-data');
// const COS = require('cos-nodejs-sdk-v5');
const request = require("request");
const WebSocket = require('ws');
const crypto = require('crypto');
// const BARRAGE_SERVER = 'wss://danmuproxy.douyu.com:8505/';// 弹幕服务器
const BARRAGE_SERVER = 'wss://wsproxy.douyu.com:667' + parseInt(Math.random() * 5 + 1) + '/'; //6671~6675
const ORIGIN = 'https://www.douyu.com';
var serverUrl = 'http://127.0.0.1';
// var minTime = 10; //s,活动剩余时间
var roomGap = 1000; //ms,ws跳转间隔
var listGap = 1000; //ms,数组采集间隔
var listNum = 0; //每页火力数，固定
var roomId = '9595';
var maxNum = 1;
var pageNum = 1;
var fireItv;
var env = true; //true:生产环境,false:本地测试
// ===========================================================================
// https://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp   data.t      
// https://www.douyu.com/swf_api/h5room/78561    data.owner_avatar
// https://www.douyu.com/gapi/rkc/directory/0_0/1   
// ===========================================================================
getServerConfig(); //入口
function getServerConfig() {
    request('https://cdn.jsdelivr.net/gh/popzoo/pop/json/paramConfig.json', function(error, response, body) {
        if (!error && response.statusCode == 200 && body != undefined) {
            try {
                let json = JSON.parse(body);
                console.info(json);
                roomGap = json.roomGap != undefined ? json.roomGap : roomGap;
                listGap = json.listGap != undefined ? json.listGap : listGap;
                // minTime = json.minTime != undefined ? json.minTime : minTime;
                serverUrl = env ? Buffer.from(json.serverUrl, 'base64').toString() : serverUrl;
                fireItv = setInterval(getFireMode, 2000); //启动
            } catch (e) {
                console.error("Failure Parse Server Config", e);
                // setTimeout(getServerConfig, 1000 * 10);
            }
        } else {
            console.error("Failure Get Server Config", error);
            // setTimeout(getServerConfig, 1000 * 10);
        }
    });
}
// get fire mode, 优先级：up,down,middle
function getFireMode() {
    request(serverUrl + '/grabmode', function(error, response, body) {
        if (!error && response.statusCode == 200 && body != undefined) {
            try {
                var json = JSON.parse(body);
                console.info(getTimeInfo() + json.msg);
                if (json.mode == "up") {
                    clearInterval(fireItv);
                    getRandomFireUrl(pageNum);
                }
            } catch (e) {
                console.error(e);
            }
        } else {
            console.error(getTimeInfo() + "Server Exception【" + serverUrl + "】");
        }
    });
}
// unlock fire mode 
function backFireMode() {
    let modeWay = "up";
    let bodyContent = {
        mode: modeWay,
        page: 1
    }; //pageNum++ or --
    request({
        url: serverUrl + "/backmode",
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json;charset=UTF-8"
        },
        body: bodyContent
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.info(getTimeInfo() + body.msg);
            // clearInterval(fireItv);
        } else {
            console.error("【" + modeWay + "】解锁释放异常，100s后服务器自动释放");
        }
        fireItv = setInterval(getFireMode, 2000);
    });
}
// new fire api
function getRandomFireUrl(pageNum) { //https://www.douyu.com/japi/weblist/apinc/allpage/9/1
    let fireRequset = "https://www.douyu.com/japi/weblist/apinc/allpage/9/" + pageNum;
    request(fireRequset, function(error, response, body) {
        if (!error && response.statusCode == 200 && body != undefined) {
            try {
                let json = JSON.parse(body);
                let roomList = json.data.rl;
                maxNum = json.data.pgcnt;
                console.info(getTimeInfo() + "###当前页面为【" + pageNum + "】，最大页面为【" + maxNum + "】###");
                var fireRoomList = [];
                for (let i = 0; i < roomList.length; i++) {
                    if (JSON.stringify(roomList[i].icv1).indexOf('\"id\":306') > -1) { //火力抓取
                        fireRoomList.push(roomList[i].rid);
                        // console.info(getTimeInfo()+"***获取"+roomList[i].rid+"房间***");
                    }
                }
                if (fireRoomList.length > 0) {
                    getFireInfo(fireRoomList);
                } else {
                    setTimeout(backFireMode, listGap);
                }
            } catch (e) {
                console.error("JSON Array Exception", e);
                backFireMode(); //异常处理
            }
        } else {
            console.error("Room List Request Error", error);
            backFireMode();
        }
    });
    //page request controller
    // function pageNumController() {
    //     if (pageNum < maxNum) {
    //         getRandomFireUrl(++pageNum);
    //     } else {
    //         pageNum = 1;
    //         backFireMode();
    //     }
    // }
    function getFireInfo(fireRoomList) {
        if (listNum == fireRoomList.length) {
            listNum = 0;
            if (pageNum < maxNum) {
                getRandomFireUrl(++pageNum);
            } else {
                pageNum = 1;
                backFireMode();
            }
        } else {
            roomId = fireRoomList[listNum];
            if (roomId != undefined) {
                start((msg) => {
                    if (JSON.stringify(msg).indexOf("fire_launch") > -1) { // ||JSON.stringify(msg).indexOf("fire_start")>-1
                        // console.log(msg);
                        if ((msg.award.indexOf("鱼丸") > -1 && parseInt(msg.award.replace("鱼丸", "")) * parseInt(msg.num) >= 100) || msg.award.indexOf("积分") == -1 && msg.award.indexOf("点播") == -1 && parseInt(msg.award) * parseInt(msg.num) >= 100) { //去除积分点播房间，可筛选实物礼物
                            console.log(getTimeInfo() + "===鱼丸达标:【" + msg.award + "×" + parseInt(msg.num) + "】===");
                            msg.weight = parseInt(msg.award.replace("鱼丸", "")) * parseInt(msg.num);
                            getRoomInfo(msg);
                        } else if (msg.award.indexOf("元") > -1 && parseInt(msg.award.substring(0, msg.award.indexOf("元"))) >= 1) {
                            console.log(getTimeInfo() + "===红包达标:【" + msg.award + "×" + parseInt(msg.num) + "】===");
                            msg.weight = parseInt(msg.award.substring(0, msg.award.indexOf("元"))) * parseInt(msg.num) * 1000; //"award":"100元红包"
                            getRoomInfo(msg);
                            // console.log(msg.award.substring(0, msg.award.indexOf("元")));
                        } else if (msg.award.indexOf("鱼翅") > -1 && parseInt(msg.award.substring(0, msg.award.indexOf("鱼翅"))) >= 1) {
                            console.log(getTimeInfo() + "===鱼翅达标:【" + msg.award + "×" + parseInt(msg.num) + "】===");
                            msg.weight = parseInt(msg.award.substring(0, msg.award.indexOf("元"))) * parseInt(msg.num) * 1000; //"award":"100元红包"
                            getRoomInfo(msg);
                        }
                    }
                });
            // } else {
                // backFireMode(); //undefined异常处理
            }
            setTimeout(function() {
                ++listNum;
                getFireInfo(fireRoomList);
            }, roomGap + parseInt(Math.random() * 200));            
        }
    }
}
// room people and anchor avatar from bojianger
function getRoomInfo(msg) {
    // if(parseInt(msg.left_time)>=minTime){
    msg.endTime = new Date().getTime() + parseInt(msg.left_time) * 1000; //前置
    // request('https://bojianger.com/data/api/common/search.do?keyword=' + msg.rid, function(error, response, body) {
    request('https://bojianger.com/data/api/common/search_anchor_new.do?tit=p1&total=false&pageNum=1&pageSize=5&keyword=' + msg.rid, function(error, response, body) {
        if (!error && response.statusCode == 200 && body != undefined) {
            try {
                let json = JSON.parse(body);
                msg.anchorImg = json.data.rows[0].avator.replace("https:", "").replace("//apic.douyucdn.cn/upload/", "");
                msg.peopleNum = json.data.rows[0].audience_count;//活跃人数
                // msg.peopleNum = json.data.rows[0].danmu_person_count;//弹幕人数
                requestDataHandle(msg);
            } catch (e) {
                console.warn("播酱数据解析失败", e);
            }
        } else {
            console.warn("播酱数据获取失败");
        }
    });
}
// deal msg data
function requestDataHandle(msg) {
    msg.winRate = (msg.weight / msg.peopleNum).toFixed(3);
    // delete msg.act_id;
    // console.info(msg); 
    delete msg.trigger;
    delete msg.type;
    delete msg.prize;
    delete msg.subtitle;
    delete msg.act_type;
    delete msg.from;
    delete msg.avatar;
    delete msg.left_time;
    delete msg.duration;
    putCrawlData(msg);
}
// put cos fire json data
function putCrawlData(msg) {
    // console.info("过滤后的数组长度为--->"+tempArray.length);
    let modeWay = "up";
    let bodyContent = {
        mode: modeWay,
        page: pageNum,
        data: msg
    };
    request({
        url: serverUrl + '/putfire',
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json;charset=UTF-8"
        },
        body: bodyContent
    }, function(error, response, body) {
        if (!error && parseInt(response.statusCode / 100) == 2) {
            console.info(getTimeInfo() + "<<<" + body + ">>>");
        } else {
            console.error(getTimeInfo() + "×××Server Connect Failure×××");
            console.error(error);
        }
    });
}
// time util
function getTimeInfo() {
    // let timeInfo = dateFormat("【mm-dd HH:MM:SS】", new Date()); //默认时区
    let timeInfo = dateFormat("【mm-dd HH:MM:SS】",new Date(new Date().getTime() + 3600000 * 8));//东八区
    // let runTime = Math.floor((new Date().getTime()-startTime)/1000);
    return timeInfo + " | ";
}
// date util
function dateFormat(fmt, date) {
    let ret;
    let opt = {
        "Y+": date.getFullYear().toString(),
        "m+": (date.getMonth() + 1).toString(),
        "d+": date.getDate().toString(),
        "H+": date.getHours().toString(),
        "M+": date.getMinutes().toString(),
        "S+": date.getSeconds().toString()
    }; // 有其他格式化字符需求可以继续添加，必须转化成字符串
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")));
        };
    };
    return fmt;
}
// =================================================
// ===================== WS Area ===================
// =================================================
// 以md5的格式创建一个哈希值
function md5(data) {
    let hash = crypto.createHash('md5');
    return hash.update(data).digest('hex');
}

// 编辑发送包
function encode(msg) {
    let data = Buffer.alloc(msg.length + 13);
    data.writeInt32LE(msg.length + 9, 0);
    data.writeInt32LE(msg.length + 9, 4);
    data.writeInt32LE(689, 8);
    data.write(msg + '\0', 12);
    return data;
}
// 小端整数转十进制进制
function littleIntToInt(byteStr) {
    let s = '';
    for (let str of byteStr) {
        s += completeHex(str.toString(16));
    }
    return parseInt(s, 16);
}
// 补 0
function completeHex(bit) {
    if (bit.length == 1) {
        return '0' + bit;
    } else if (bit.length == 2) {
        return bit;
    }
}
// 解析收到的字节包
function decode(bytes, callback) {
    /**
     * 一个数据包可能有多条信息
     * 前 4 个字节为当前条数据的长度
     * 前 24 字节为长度和头部, 过滤掉, 剩下的为数据部分
     * 每条数据会多占 4 个字节, 暂时不知道用处
     */
    // 消息总长度
    let totalLength = bytes.length;
    // 当前消息长度
    let len = 0;
    // 已解析的消息长度
    let decodedMsgLen = 0;
    // 单条消息的 buffer
    let singleMsgBuffer = null;
    // 取长度的 16 进制
    let lenStr;
    while (decodedMsgLen < totalLength) {
        lenStr = bytes.slice(decodedMsgLen, decodedMsgLen + 4);
        len = littleIntToInt(lenStr.reverse()) + 4;
        singleMsgBuffer = bytes.slice(decodedMsgLen, decodedMsgLen + len);
        decodedMsgLen += len;
        // 去除头部和尾部的 '\0'
        let byteDatas = singleMsgBuffer.slice(12, singleMsgBuffer.length - 2).toString().split('/');
        // 解析后的消息对象
        let decodedMsg = {};
        for (let item of byteDatas) {
            let arr = item.split('@=');
            try {
                decodedMsg[arr[0].replace(/@S/g, '\/').replace(/@A/g, '@')] = arr[1].replace(/@S/g, '').replace(/@A/g, '');
            } catch (e) {
                console.log(arr[0]);
                console.log(arr[1]);
                backFireMode(); //异常处理
            }
        }
        callback(decodedMsg);
    }
}
// 获取随机devid
function guid() {
    return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
// 发送初始化包
function init(ws) { //wsproxy
    // 登录信息
    let devid = guid();
    let curTime = parseInt(new Date().getTime() / 1000);
    let vk = md5(curTime + "r5*^5;}2#${XF[h+;'./.Q'1;,-]f'p[" + devid);
    let login_msg = `type@=loginreq/roomid@=${roomId}/dfl@=/username@=/password@=/ltkid@=/biz@=/stk@=/devid@=${devid}/ct@=0/pt@=2/cvr@=0/tvr@=7/apd@=/rt@=${curTime}/vk@=${vk}/ver@=20190610/aver@=218101901/dmbt@=chrome/dmbv@=80/`;
    ws.send(encode(login_msg));
}
// 启动连接
function start(callback) {
    // 建立连接
    let ws = new WebSocket(BARRAGE_SERVER, {
        origin: ORIGIN
    });
    // 初始化并维护连接
    ws.on('open', () => {
        console.info(getTimeInfo() + "@@@连到" + roomId + "房间@@@");
        init(ws);
    });
    // 处理收到的消息
    ws.on('message', (data) => {
        decode(data, (msg) => {
            callback(msg);
        });
        setTimeout(function() {
            ws.close()
        }, roomGap); //关闭连接
    });
    // 自动关闭ws
    ws.on('close', () => {
        console.log(getTimeInfo() + '***WS关闭***');
    });
    // 异常处理
    ws.on('error', () => {
        console.error(getTimeInfo() + '***WS异常***');
    });
}

module.exports = app;
// get cos json data
// function getCosFireData(tempArray){
//     request(serverUrl+'/getfire', function (error, response, body) {
//         if (!error && response.statusCode == 200 && body!=undefined) {
//             try{
//                 var cloudList = JSON.parse(body);
//                 cloudList = cloudList.concat(tempArray);
//                 for (let i = 0; i < cloudList.length; i++) {
//                     if (parseInt((cloudList[i].endTime - new Date().getTime() )/1000) < minTime) {//结束时间不小于s
//                         cloudList.splice(i, 1); //删除数组
//                     }
//                 }
//                 putCosFireData(distinctFireList(cloudList));
//             }catch(error){
//                 console.error(error);
//                 setTimeout(pageNumController,listGap);
//             }
//         }else{
//             console.warn("获取cos对象失败");
//             putCosFireData(distinctFireList(tempArray));        
//         }
//     });
// }
// remove reduplication
// function distinctFireList(arr) {
//     arr.sort(function(a, b) {
//         return b.winRate - a.winRate; 
//     });
//     result = [];
//     for (let i = 0; i < arr.length; i++) {
//         for (let j = i + 1; j < arr.length; j++) {
//             if (arr[i].rid == arr[j].rid) {
//                 j = ++i;
//             }
//         }
//         result.push(arr[i]);
//     }
//     return result; //result.reverse();
// }
// get avatar from dy
// function getAnchorAvatar(msg){
//     request('https://www.douyu.com/swf_api/h5room/'+msg.rid, function (error, response, body) {
//         if (!error && response.statusCode == 200) {
//             let json = JSON.parse(body);
//             if(json.data.owner_avatar!=undefined){
//                 msg.anchorImg = json.data.owner_avatar.replace("https:","").replace("//apic.douyucdn.cn/upload/","");
//             }else{
//                 msg.anchorImg = 0;
//             }
//             requestDataHandle(msg);
//         }else{
//             requestDataHandle(msg);
//         }
//     });    
// }
// get statdard time from taobao
// function getStandardTime(){
//     request('https://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp', function (error, response, body) {
//         if (!error && response.statusCode == 200) {
//             // console.log(body);
//             let json = JSON.parse(body);
//             let timeStamp = json.data.t;
//             console.info(rmId+"------------"+peopleNum+"------------"+anchorPic);
//         }
//     });
// }
// function getCosFireData(tempArray){
//     request('https://popzoo-1253626683.cos.ap-beijing.myqcloud.com/FireStat/fireRoom.json', function (error, response, body) {
//         if (!error && response.statusCode == 200 && body!=undefined) {
//             try{
//                 let cloudList = JSON.parse(body);
//                 for (let i = 0; i < cloudList.length; i++) {
//                     if (parseInt((cloudList[i].endTime - new Date().getTime() )/1000) < minTime) {//结束时间不小于s
//                         cloudList.splice(i, 1); //删除数组
//                     }
//                 }
//                 tempArray = cloudList.concat(tempArray);
//                 putCosFireData(distinctFireList(tempArray));                  
//             }catch(error){
//                 console.error(error);
//                 setTimeout(pageNumController,listGap);
//             }
//         }else{
//             console.warn("获取cos对象失败");
//             putCosFireData(distinctFireList(tempArray));        
//         }
//     });
// }
// function putCosFireData(tempArray){
//     var fd = {key:'FireStat/fireRoom.json', 'Content-Type':'', file:JSON.stringify(tempArray)};
//     request.post({url:'https://popzoo-1253626683.cos.ap-beijing.myqcloud.com/', formData:fd}, function(error, response, body) {
//         if (!error && parseInt(response.statusCode/100)==2) {
//             // && body.headers.etag != null
//              console.info("<<<<<<<<<<<< FireListPut:Success >>>>>>>>>>>>");
//         }else{
//             console.error("<<<<<<<<<<<< FireListPut:Failure >>>>>>>>>>>>");
//             console.error(error,response,body);
//         }        
//     })    
// }

