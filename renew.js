function currentDate(){
    let dateStr = getTimeInfo(false);
    console.info('更新时间'+dateStr);
    return '更新时间'+ dateStr;
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
currentDate();