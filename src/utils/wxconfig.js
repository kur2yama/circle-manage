import {getwxconfigApi } from "../api/post";
export const wxconfig={
    data(){
        return {
            shareImg:"http://m-zhijiang.cjyun.org/huodong/images/share.png"
        }
    },
    mounted() {
        this.getwxconfig();
    },
    methods:{
        getwxconfig(){
            var params = {
                url:encodeURIComponent(location.href)
            }
            getwxconfigApi(params).then(res=>{
                if(res.state){
                    wx.config({
                        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        appId: res.data.appId, // 必填，公众号的唯一标识
                        timestamp: res.data.timestamp, // 必填，生成签名的时间戳
                        nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
                        signature: res.data.signature,// 必填，签名，见附录1
                        jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone','checkJsApi', 'scanQRCode'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                    });
                }
            }).catch(error=>{
                console.log(error)
            })
        },
        wxready(wechat){
            var _this = this;
            wx.ready(function () {
                //分享到朋友圈
                wx.onMenuShareTimeline({
                    title: wechat.title, // 分享标题
                    link: wechat.link, // 分享链接
                    imgUrl: wechat.imgUrl?wechat.imgUrl:_this.shareImg, // 分享图标
                    success: function () {
                        // 用户确认分享后执行的回调函数
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                    }
                });
                //获取“分享给朋友”按钮点击状态及自定义分享内容接口
                wx.onMenuShareAppMessage({
                    title: wechat.title, // 分享标题
                    desc: wechat.desc, // 分享描述
                    link: wechat.link, // 分享链接
                    imgUrl: wechat.imgUrl?wechat.imgUrl:_this.shareImg, // 分享图标,注意图标宽高要大于300px
                    type: '', // 分享类型,music、video或link，不填默认为link
                    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                    success: function () {
                        // 用户确认分享后执行的回调函数
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                    },
                    fail: function (res) {
//                    alert("分享失败：" +JSON.stringify(res));
                        console.log("分享失败：" + JSON.stringify(res));
                    }
                });
                //获取“分享到QQ”按钮点击状态及自定义分享内容接口
                wx.onMenuShareQQ({
                    title: wechat.title, // 分享标题
                    desc: wechat.desc, // 分享描述
                    link: wechat.link, // 分享链接
                    imgUrl: wechat.imgUrl?wechat.imgUrl:_this.shareImg, // 分享图标
                    success: function () {
                        // 用户确认分享后执行的回调函数
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                    }
                });
                //获取“分享到腾讯微博”按钮点击状态及自定义分享内容接口
                wx.onMenuShareWeibo({
                    title: wechat.title, // 分享标题
                    desc: wechat.desc, // 分享描述
                    link: wechat.link, // 分享链接
                    imgUrl: wechat.imgUrl?wechat.imgUrl:_this.shareImg, // 分享图标
                    success: function () {
                        // 用户确认分享后执行的回调函数
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                    }
                });
                //获取“分享到QQ空间”按钮点击状态及自定义分享内容接口
                wx.onMenuShareQZone({
                    title: wechat.title, // 分享标题
                    desc: wechat.desc, // 分享描述
                    link: wechat.link, // 分享链接
                    imgUrl: wechat.imgUrl?wechat.imgUrl:_this.shareImg, // 分享图标
                    success: function () {
                        // 用户确认分享后执行的回调函数
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                    }
                });
            });
        }
    }
}