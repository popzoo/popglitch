(function() {
    // CNZZ statistic
    // document.write(unescape("%3Cspan style='display:none' id='cnzz_stat_icon_1278051049'%3E%3C/span%3E%3Cscript src='https://s4.cnzz.com/z_stat.php%3Fid%3D1278051049' type='text/javascript'%3E%3C/script%3E"));
    // <!--  Google Analytics Start -->
    // <script async src=""></script>
    let gstat = document.createElement("script");
    gstat.setAttribute("type", "text/javascript");
    gstat.setAttribute("src", "https://www.googletagmanager.com/gtag/js?id=G-JG6PBMLH1B");
    document.body.appendChild(gstat);
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'G-JG6PBMLH1B');
    // <!-- Global Site Analytics End -->

    let serverUrl = document.location.protocol + '//' + document.domain;
    if (document.getElementById("own_home") != undefined) {
        document.getElementById("own_home").setAttribute("href", serverUrl + "/index.html"); //popzoo.github.io/zoo/
    }
    if (document.getElementById("own_time") != undefined) {
        document.getElementById("own_time").setAttribute("href", serverUrl + "/time.html"); //popzoo.github.io/zoo/
    }
    if (document.getElementById("own_danmu") != undefined) {
        document.getElementById("own_danmu").setAttribute("href", serverUrl + "/danmu.html"); //popzoo.github.io/danmu/
    }
    if (document.getElementById("own_fire") != undefined) {
        document.getElementById("own_fire").setAttribute("href", serverUrl + "/fire.html"); //popzoo.github.io/pop/
    }
    if (document.getElementById("own_gift") != undefined) {
        document.getElementById("own_gift").setAttribute("href", serverUrl + "/gift.html"); ////popzoo.github.io/pop/giftshow.html
    }
    if (document.getElementById("own_car") != undefined) {
        document.getElementById("own_car").setAttribute("href", serverUrl + "/car.html"); //popzoo.github.io/pop/motorcade.html
    }
    if (document.getElementById("own_form") != undefined) {
        document.getElementById("own_form").setAttribute("href", serverUrl + "/form.html"); //popzoo.github.io/form/
    }
    if (document.getElementById("own_data") != undefined) {
        document.getElementById("own_data").setAttribute("href", serverUrl + "/bi.html"); //popzoo.github.io/bi/
    }
    if (document.getElementById("own_audio") != undefined) {
        document.getElementById("own_audio").setAttribute("href", serverUrl + "/audio.html");
    }
    if (document.getElementById("own_novel") != undefined) {
        document.getElementById("own_novel").setAttribute("href", serverUrl + "/novel.html");
    }
    if (document.getElementById("own_comic") != undefined) {
        document.getElementById("own_comic").setAttribute("href", serverUrl + "/comic.html");
    }
    // github link
    if (document.getElementById("left_link") != undefined) {
        document.getElementById("left_link").setAttribute("href", "https://ghproxy.com/");
    }
    if (document.getElementById("right_link") != undefined) {
        document.getElementById("right_link").setAttribute("href", "https://github.com/ripienaar/free-for-dev");
    }
    // document.getElementById("status_open").setAttribute("href",serverUrl+"/setstatus?status=1&nickName=admin");
    // document.getElementById("status_close").setAttribute("href",serverUrl+"/setstatus?status=0&nickName=admin");
    //====================================================== 
    window.addEventListener('load', () => {
        console.info('\n' + ' %c Author GitHub ' + ' %c https://github.com/popzoo ' + '\n', 'color: #fadfa3; background: #030307; padding:5px 0;', 'background: #fadfa3; padding:5px 0;');
        console.info(`%cPopzoo Page Loaded Time:【${Math.round(performance.now() * 100) / 100}】ms`, 'text-shadow: 0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 4px 0 #b9b9b9, 0 5px 0 #aaa, 0 6px 1px rgba(0, 0, 0, .1), 0 0 5px rgba(0, 0, 0, .1), 0 1px 3px rgba(0, 0, 0, .3), 0 3px 5px rgba(0, 0, 0, .2), 0 5px 10px rgba(0, 0, 0, .25), 0 10px 10px rgba(0, 0, 0, .2), 0 20px 20px rgba(0, 0, 0, .15);\
            font-size: 2em;');
    });
    //  //====================================================== 
    var OriginTitile = document.title,
        titleTime;
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            document.title = '小主丢了⊂⊙_⊙⊃';
            clearTimeout(titleTime);
        } else {
            document.title = '牵主回家┗(^_^)┛';
            titleTime = setTimeout(function() {
                document.title = OriginTitile;
            }, 3000);
        }
    });
    //====================================================== 
    // 初始化看板娘，PC端显示，手机端隐藏 未优化（貌似自带） 
    function loadExternalResource(url, type) {
        return new Promise((resolve, reject) => {
            let tag;
            if (type === "css") {
                tag = document.createElement("link");
                tag.rel = "stylesheet";
                tag.type = "text/css";
                tag.href = url;
            } else if (type === "js") {
                tag = document.createElement("script");
                tag.type = "text/javascript";
                tag.src = url;
            }
            if (tag) {
                tag.onload = () => resolve(url);
                tag.onerror = () => reject(url);
                document.head.appendChild(tag);
            }
        });
    }
    // const live2d_path = "https://file.popzoo.ga/https://raw.githubusercontent.com/popsee/live2d-all/main/";
    // const live2d_path = "https://door.popsee.ga/https/cdn.jsdelivr.net/gh/popsee/live2d-all/";//跨域
    const live2d_path = "https://popzoo.glitch.me/live2d/";//跨域
    // const live2d_path = "./live2d-all/";
    if (screen.width >= 768 && document.URL.indexOf('bi.html') == -1) { //手机窄屏不显示live2d
        Promise.all([
            // loadExternalResource("https://cdn.jsdelivr.net/npm/font-awesome/css/font-awesome.min.css", "css"), //图标加载
            loadExternalResource("https://popzoo.glitch.me/npm/font-awesome@4.7.0/css/font-awesome.min.css", "css"), //图标加载
            loadExternalResource(live2d_path + "font-awesome.min.css", "css"), //图标加载
            loadExternalResource(live2d_path + "waifu.css", "css"),
            loadExternalResource(live2d_path + "live2d.min.js", "js"),
            loadExternalResource(live2d_path + "waifu-tips.js", "js")
        ]).then(() => {
            initWidget({
                waifuPath: live2d_path + "waifu-tips.json",
                cdnPath: live2d_path
            });
        });
    }
})();