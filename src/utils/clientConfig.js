let clientConfig={
    data(){
        return {

        }
    },
    mounted() {

    },
    methods:{
        open() {

        },
        openApp(url, callback){
            let {isAndroid, isIOS, isIOS9} = this.detectVersion()
            if (isIOS) {
                var timeout, t = 4000, hasApp = true;
                var openScript = setTimeout(function () {
                    if (!hasApp) {
                        callback && callback()
                    }
                    document.body.removeChild(ifr);
                }, 5000)

                var t1 = Date.now();
                var ifr = document.createElement("iframe");
                ifr.setAttribute('src', url);
                ifr.setAttribute('style', 'display:none');
                document.body.appendChild(ifr);

                timeout = setTimeout(function () {
                    var t2 = Date.now();
                    if (t2 - t1 < t + 100) {
                        hasApp = false;
                    }
                }, t);
            }
            if (isAndroid) {
                window.location.href = url;
                setTimeout(()=>{
                    let hidden = window.document.hidden || window.document.mozHidden || window.document.msHidden ||window.document.webkitHidden
                    if(typeof hidden =="undefined" || hidden ==false){
                        this.goConfirmAddr();
                    }
                }, 5000);
            }
            if (isIOS9) {
                location.href = url;
                setTimeout(function () {
                    callback && callback()
                }, 250);
                // setTimeout(function () {
                // location.reload();
                // }, 1000);
            }
        },
        detectVersion(){
            let isAndroid, isIOS, isIOS9, version,
                u = navigator.userAgent,
                ua = u.toLowerCase();

            if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {   //android终端或者uc浏览器
                //Android系统
                isAndroid = true
            }
            if (ua.indexOf("like mac os x") > 0) {
                //ios
                var regStr_saf = /os [\d._]*/gi;
                var verinfo = ua.match(regStr_saf);
                version = (verinfo + "").replace(/[^0-9|_.]/ig, "").replace(/_/ig, ".");
            }
            var version_str = version + "";
            if (version_str != "undefined" && version_str.length > 0) {
                version = parseInt(version)
                if (version >= 8) {
                    // ios9以上
                    isIOS9 = true
                } else {
                    isIOS = true
                }
            }
            return {isAndroid, isIOS, isIOS9}
        },
        goConfirmAddr(){
            if (mc.isClient()) {
                return
            }
            location.href = 'https://sj.qq.com/appdetail/com.cj.yun.xiangyang';
        },
        isAndroidStyle(){
            let {isAndroid, isIOS, isIOS9} = this.detectVersion();
            return isAndroid && !this.isIsWxClient();
        },
        isIsWxClient () {
            var ua = navigator.userAgent.toLowerCase();
            if (ua.match(/MicroMessenger/i) == "micromessenger") {
                return true;
            }
            return false;
        },
    }
}

export default clientConfig;