// const https = require('https');
// const barkKey = 'https://api.day.app/rBvsC5fAjauLmXSs8ip5V';
const request = require("request");

function currentDate() {
    let dateStr = '📲POPGitch自动更新📲 \n';
    dateStr += getTimeInfo(false) +' \n';
    dateStr += '自动更新部署平台：Flyio, Koyeb, Heroku \n';
    dateStr += '需手动部署平台：Glitch, Replit, Dragon \n';
    dateStr += '已废弃用平台：RailWay, LeanCloud \n';
    dateStr += '备胎候选平台：Render, NorthFlank \n';
    console.info(dateStr);
    return dateStr;
}
// time util
function getTimeInfo(isShort) {
    let formatStr = isShort ? "【HH:MM:SS】" : "【YYYY-mm-dd HH:MM:SS】";
    let timezone = 8; //目标时区时间，东八区   东时区正数 西市区负数
    let offset_GMT = new Date().getTimezoneOffset(); // 本地时间和格林威治的时间差，单位为分钟
    let targetDate = new Date(new Date().getTime() + offset_GMT * 60 * 1000 + timezone * 60 * 60 * 1000);
    let timeInfo = dateFormat(formatStr, targetDate); //东八区
    return timeInfo;
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
// push msg
function pushTGBot(text) {
    const BOT_TOKEN = "5250809169:AAFcfyeZHMF_oYDm15DDu2kMIacI9wIEjBc";
    const CHAT_ID = "1892620917";
    let url = "https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage";
    // let url = "https://tele.popsee.ga/bot" + BOT_TOKEN + "/sendMessage";
    request({
        url: url,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36 Edg/88.0.705.74"
        },
        form: {
            'chat_id': CHAT_ID,
            'parse_mode': 'Markdown',
            'text': currentDate()
        }
    }, function (error, response, body) {
        if (!error && response.statusCode < 400 && body != undefined) {
            console.info(body);
        } else {
            console.error("TGBot PUSH Failure", error);
        }
    });
}    
pushTGBot();

// function sendMsg() {
//     let hookAddr = barkKey + encodeURI(currentDate());
//     https.get(hookAddr, res => {
//         // console.info(res.statusCode);
//         let list = [];
//         res.on('data', chunk => {
//             list.push(chunk);
//         });
//         res.on('end', () => {
//             let data = JSON.parse(Buffer.concat(list).toString());
//             console.info(data);
//         });
//         console.info("推送成功");
//     }).on('error', err => {
//         console.error('Error: ', err.message);
//         console.error("推送失败");
//     });
// }
// sendMsg();
