// ==================================================================
// ==================================================================
// ==================================================================
// npm install crypto
// npm install ws
// npm install request
'use strict';
// ============非必须===============
console.log("\u001b[32m  ,---.  ,---.  ,---. ,-----. ,---.  ,---.      ,---. `--',-'  '-. ,---.  \u001b[0m");
console.log("\u001b[32m | .-. || .-. || .-. |`-.  / | .-. || .-. |    (  .-' ,--.'-.  .-'| .-. : \u001b[0m");
console.log("\u001b[32m | '-' '' '-' '| '-' ' /  `-.' '-' '' '-' '    .-'  `)|  |  |  |  \   --. \u001b[0m");
console.log("\u001b[32m |  |-'  `---' |  |-' `-----' `---'  `---'     `----' `--'  `--'   `----' \u001b[0m");
console.log("\u001b[32m `--'          `--'                                                       \u001b[0m");
// =================================
const request = require("request");
const WebSocket = require('ws');
const crypto = require('crypto');
// const BARRAGE_SERVER = 'wss://danmuproxy.douyu.com:8505/';// 弹幕服务器
const BARRAGE_SERVER = 'wss://wsproxy.douyu.com:667' + parseInt(Math.random() * 5 + 1) + '/'; //6671~6675
const ORIGIN = 'https://www.douyu.com';
var FSFilter = ['吻', '歌', '唱', '舞']; //火力排除词汇由param控制
var serverUrl = 'http://127.0.0.1';
// var minTime = 10; //s,活动剩余时间
var roomGap = 1000; //ms,ws跳转间隔
var listGap = 1000; //ms,数组采集间隔
var grabGap = 4000; //ms grabmode间隔
var listNum = 0; //每页火力数，固定
var roomId = '9595';
var maxPage = 1;
var currPage = 1;
// var fireItv;
// const env = true; //true:生产环境,false:本地测试
var startTime, overTime, monitorTime;
const platform = process.env.platform != null ? process.env.platform : 'local';//https://ident.me/,https://ip.qaros.com/
// ===========================================================================
// https://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp   data.t      
// https://www.douyu.com/swf_api/h5room/78561    data.owner_avatar
// https://www.douyu.com/gapi/rkc/directory/0_0/1   
// ===========================================================================
setInterval(() => {
    if (new Date().getTime() - monitorTime > 200 * 1000) { //3min无运行，则从新启动
        getFireMode();
    }
}, 20 * 1000);
function initParamConfig(retry) {
    let paramUrl = retry ? 'https://popglitch.popsee.repl.co/initparam' : 'https://popbob.ml/initparam';//'https://param.firenet.workers.dev';
    request({
        url: paramUrl,
        method: "GET",
        json: true,
        timeout: 5 * 1000
    }, function (error, response, body) {
        if (!error && response.statusCode < 400 && body != undefined) {
            // serverUrl = env ? 'http://' + Buffer.from(body.originUrl.substr(3), 'base64').toString() : serverUrl;
            // 国内本地上传直接用ip，国外则用vercel上传，防止特殊时期切断网络
            serverUrl = platform == 'local' ? 'http://' + Buffer.from(body.originUrl.substr(3), 'base64').toString() : Buffer.from(body.domainUrl, 'base64').toString();//Buffer.from(body.mirrorUrl, 'base64').toString();
            FSFilter = body.FSFilter;
            // console.info('serverUrl---->' + serverUrl);
            getFireMode();
        } else {
            if (retry) {
                console.error("Param Request Failure", error);
                setTimeout(initParamConfig, 30 * 1000); //30s后重试
            } else {
                initParamConfig(true);
            }
        }
    });
}
// get fire mode, 优先级：up,down,middle
function getFireMode() {
    request({
        url: serverUrl + '/grabmode?platform=' + platform,
        method: "GET",
        json: true,
        timeout: 5 * 1000
    }, function (error, response, body) {
        if (!error && response.statusCode < 400 && body != undefined) {
            console.info(getTimeInfo() + body.msg);
            if (body.mode == "up") {
                startTime = new Date().getTime();
                // clearInterval(fireItv);
                getRandomFireUrl(1);
            } else {
                setTimeout(getFireMode, grabGap);
            }
        } else {
            console.error(getTimeInfo() + "服务器异常【" + serverUrl + "】");
            setTimeout(getFireMode, grabGap);
        }
        monitorTime = new Date().getTime();
    });
}
// unlock fire mode 
function backFireMode() {
    overTime = new Date().getTime();
    let modeWay = "up";
    let bodyContent = {
        time: parseInt((overTime - startTime) / 1000),
        mode: modeWay
        // page: 1
    }; //currPage++ or --
    request({
        url: serverUrl + "/backmode?platform=" + platform,
        method: "POST",
        json: true,
        timeout: 10 * 1000,
        body: bodyContent
    }, function (error, response, body) {
        if (!error && response.statusCode < 400 && body != undefined) {
            console.info(getTimeInfo() + body.msg); //返回解锁成果
        } else {
            console.error("解锁请求异常", error);
            // setTimeout(backFireMode, 1500);
        }
        setTimeout(getFireMode, grabGap);
    });
}
// new fire api
function getRandomFireUrl(currPage) { //https://www.douyu.com/japi/weblist/apinc/allpage/9/1
    request({
        url: "https://www.douyu.com/japi/weblist/apinc/allpage/9/" + currPage,
        method: "GET",
        header: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36" },
        json: true,
        timeout: 10 * 1000
    }, function (error, response, body) {
        if (!error && response.statusCode < 400 && body != undefined) {
            let roomList = body.data.rl;
            maxPage = body.data.pgcnt;
            console.info(getTimeInfo() + "###当前页面为【" + currPage + "】，最大页面为【" + maxPage + "】###");
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
        } else {
            console.error("房间列表请求错误", error);
            backFireMode();
        }
    });
    //page request controller
    // function pageNumController() {
    //     if (currPage < maxPage) {
    //         getRandomFireUrl(++currPage);
    //     } else {
    //         currPage = 1;
    //         backFireMode();
    //     }
    // }
    function getFireInfo(fireRoomList) {
        if (listNum == fireRoomList.length) {
            listNum = 0;
            if (currPage < maxPage) {
                getRandomFireUrl(++currPage);
            } else {
                currPage = 1;
                backFireMode();
            }
        } else {
            roomId = fireRoomList[listNum];
            if (roomId != undefined) {
                start((msg) => {
                    if (JSON.stringify(msg).indexOf("fire_launch") > -1) { // ||JSON.stringify(msg).indexOf("fire_start")>-1
                        // console.log(msg);
                        // if ((msg.award.indexOf("鱼丸") > -1 && parseInt(msg.award.replace("鱼丸", "")) * parseInt(msg.num) >= 100) || msg.award.indexOf("积分") == -1 && msg.award.indexOf("点播") == -1 && parseInt(msg.award) * parseInt(msg.num) >= 100) { //去除积分点播房间，可筛选实物礼物
                        //     console.log(getTimeInfo() + "===鱼丸达标:【" + msg.award + "×" + parseInt(msg.num) + "】===");
                        //     msg.weight = parseInt(msg.award.replace("鱼丸", "")) * parseInt(msg.num);
                        //     getRoomInfo(msg);
                        // } else if (msg.award.indexOf("元") > -1 && parseInt(msg.award.substring(0, msg.award.indexOf("元"))) >= 1) {
                        //     console.log(getTimeInfo() + "===红包达标:【" + msg.award + "×" + parseInt(msg.num) + "】===");
                        //     msg.weight = parseInt(msg.award.substring(0, msg.award.indexOf("元"))) * parseInt(msg.num) * 1000; //"award":"100元红包"
                        //     getRoomInfo(msg);
                        //     // console.log(msg.award.substring(0, msg.award.indexOf("元")));
                        // } else if (msg.award.indexOf("鱼翅") > -1 && parseInt(msg.award.substring(0, msg.award.indexOf("鱼翅"))) >= 1) {
                        //     console.log(getTimeInfo() + "===鱼翅达标:【" + msg.award + "×" + parseInt(msg.num) + "】===");
                        //     msg.weight = parseInt(msg.award.substring(0, msg.award.indexOf("元"))) * parseInt(msg.num) * 1000;
                        //     getRoomInfo(msg);
                        // } else if (msg.award.indexOf("鱼粮") > -1 && parseInt(msg.award.substring(0, msg.award.indexOf("鱼粮"))) >= 1) {
                        //     console.log(getTimeInfo() + "===鱼粮达标:【" + msg.award + "×" + parseInt(msg.num) + "】===");
                        //     msg.weight = parseInt(msg.award.replace("鱼粮", "")) * parseInt(msg.num);
                        //     getRoomInfo(msg);
                        // }
                        var isWorthUp = true;
                        for (let j = 0; j < FSFilter.length; j++) {
                            if (msg.award.indexOf(FSFilter[j]) > -1) {
                                isWorthUp = false;
                            }
                        }
                        if (isWorthUp) {
                            console.log(getTimeInfo() + "===火力达标:【" + msg.award + "×" + parseInt(msg.num) + "】===");
                            if (msg.award.indexOf("鱼丸") > -1 || msg.award.indexOf("鱼丸") > -1) {
                                msg.weight = 100 * parseInt(msg.num);
                            } else {
                                msg.weight = 500 * parseInt(msg.num);
                            }
                            getRoomInfo(msg);
                        }
                    }
                });
                // } else {
                // backFireMode(); //undefined异常处理
            }
            setTimeout(() => {
                ++listNum;
                getFireInfo(fireRoomList);
            }, roomGap + parseInt(Math.random() * 200));
        }
    }
}
// room people and anchor avatar from bojianger
function getRoomInfo(msg) {
    msg.endTime = parseInt(new Date().getTime() / 1000) + parseInt(msg.left_time); //前置
    // request('https://bojianger.com/data/api/common/search.do?keyword=' + msg.rid, function(error, response, body) {
    request({
        url: 'https://www.douyu.com/swf_api/h5room/' + msg.rid,
        method: "GET",
        json: true,
        timeout: 10 * 1000
    }, function (error, response, body) {
        if (!error && response.statusCode < 400 && body != undefined) {
            // msg.anchorImg = body.data.owner_avatar;//主播头像
            // https://rpic.douyucdn.cn/live-cover/appCovers/2021/08/28/5974517_20210828233359_small.jpg
            // https://rpic.douyucdn.cn/asrpic/210920/3800278_1432.png/dy1          两种图片形式
            msg.avatar = body.data.room_src.replace('https://rpic.douyucdn.cn/', '').replace('/dy1', ''); //房间截图
            msg.fans = body.data.fans; //活跃人数
        } else {
            console.error("头像获取失败");
        }
        requestDataHandle(msg);
    });
}
// deal msg data
function requestDataHandle(msg) {
    msg.winRate = (msg.weight * 10 / msg.fans).toFixed(3);
    // delete msg.act_id;
    delete msg.trigger;
    delete msg.type;
    delete msg.prize;
    delete msg.subtitle;
    delete msg.act_type;
    delete msg.from;
    // delete msg.avatar;
    delete msg.left_time;
    delete msg.duration;
    // console.info(msg);
    putCrawlData(msg);
}
// ======================================================================
// ======================================================================
// ======================================================================
// put cos fire json data
function putCrawlData(msg) {
    // console.info("过滤后的数组长度为--->"+tempArray.length);
    let bodyContent = {
        mode: 'up',
        page: currPage,
        data: msg
    };
    request({
        url: serverUrl + '/putfire?platform=' + platform,
        method: "POST",
        json: true,
        body: bodyContent
    }, function (error, response, body) {
        if (!error && response.statusCode < 400 && body != undefined) {
            console.info(getTimeInfo() + "^^^" + body.msg + "^^^");
        } else {
            console.error(getTimeInfo() + "×××服务器连接失败×××", error);
        }
        monitorTime = new Date().getTime();
    });
}
// ======================================================================
// ======================================================================
// ======================================================================
// time util
function getTimeInfo() {
    // let timeInfo = dateFormat("【mm-dd HH:MM:SS】", new Date()); //默认时区
    let timeInfo = dateFormat("【mm-dd HH:MM:SS】", new Date(new Date().getTime() + 3600000 * 8)); //东八区
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
    return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, function (c) {
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
        setTimeout(function () {
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
//入口
module.exports = initParamConfig;
// initParamConfig();

// ==================================================================
// ====================== COS Fire Store ============================
// ==================================================================
// get cos json data
// function getCosFireData(tempArray){
//     request(serverUrl+'/getfire', function (error, response, body) {
//         if (!error && response.statusCode < 400 && body!=undefined) {
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
// reduce duplication
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
//         if (!error && response.statusCode < 400) {
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
//         if (!error && response.statusCode < 400) {
//             // console.log(body);
//             let json = JSON.parse(body);
//             let timeStamp = json.data.t;
//             console.info(rmId+"------------"+peopleNum+"------------"+anchorPic);
//         }
//     });
// }
// function getCosFireData(tempArray){
//     request('https://popzoo-1253626683.cos.ap-beijing.myqcloud.com/FireStat/fireRoom.json', function (error, response, body) {
//         if (!error && response.statusCode < 400 && body!=undefined) {
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