const https = require('https');
const barkKey = 'https://api.day.app/rBvsC5fAjauLmXSs8ip5V';


function currentDate() {
    let dateStr = '/📲POPGitch自动更新📲/ \r';
    dateStr += getTimeInfo(false) +' \r';
    dateStr += '自动更新部署平台：RailWay,Heroku,Koyeb \r';
    dateStr += '需手动部署平台：Glitch,Replit,LeanCloud \r';
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

function sendMsg() {
    let hookAddr = barkKey + encodeURI(currentDate());
    https.get(hookAddr, res => {
        // console.info(res.statusCode);
        let list = [];
        res.on('data', chunk => {
            list.push(chunk);
        });
        res.on('end', () => {
            let data = JSON.parse(Buffer.concat(list).toString());
            console.info(data);
        });
        console.info("推送成功");
    }).on('error', err => {
        console.error('Error: ', err.message);
        console.error("推送失败");
    });
}
sendMsg();
