let commonJs = {
    data(){
        return {

        }
    },
    mounted() {
        // document.body.addEventListener('touchmove', function(e) {
        //     if(!!e._isScroller) {
        //         e.preventDefault();
        //     }
        //
        // }, {
        //     passive: false
        // });
    },
    methods:{
        getThumb(image) {
            return image.thumb.url || image.thumbs.url || image.thumb[0].url || image.thumbs[0].url
        }
    },
    filters:{
        filterTime(dateTimeStamp){
            if(!dateTimeStamp) return '';
            // var dateStamp = new Date(dateTimeStamp.replace(/-/g,'/')).getTime()
            var dateStamp = dateTimeStamp*1000;
            var minute = 1000 * 60; //把分，时，天，周，半个月，一个月用毫秒表示
            var hour = minute * 60;
            var day = hour * 24;
            var week = day * 7;
            var halfamonth = day * 15;
            var month = day * 30;
            var year = day * 365;
            var now = new Date().getTime(); //获取当前时间毫秒
            var diffValue = now - dateStamp; //时间差
            if (diffValue < 0) {
                return;
            }
            var minC = diffValue / minute; //计算时间差的分，时，天，周，月
            var hourC = diffValue / hour;
            var dayC = diffValue / day;
            var weekC = diffValue / week;
            var monthC = diffValue / month;
            var yearC = diffValue / year;
            var result
            if (dayC >= 1 && dayC <= 7) {
                result = " " + parseInt(dayC) + "天前";
            } else if (hourC >= 1 && hourC <= 24) {
                result = " " + parseInt(hourC) + "小时前";
            } else if (minC >= 1 && minC <= 60) {
                result = " " + parseInt(minC) + "分钟前";
            } else if (diffValue >= 0 && diffValue <= minute) {
                result = "刚刚";
            } else {
                var datetime = new Date();
                datetime.setTime(dateStamp);

                var Nyear = datetime.getFullYear();
                var Nmonth =
                    datetime.getMonth() + 1 < 10
                        ? "0" + (datetime.getMonth() + 1)
                        : datetime.getMonth() + 1;
                var Ndate =
                    datetime.getDate() < 10
                        ? "0" + datetime.getDate()
                        : datetime.getDate();
                var Nhour =
                    datetime.getHours() < 10
                        ? "0" + datetime.getHours()
                        : datetime.getHours();
                var Nminute =
                    datetime.getMinutes() < 10
                        ? "0" + datetime.getMinutes()
                        : datetime.getMinutes();
                var Nsecond =
                    datetime.getSeconds()< 10
                        ? "0" + datetime.getSeconds()
                        : datetime.getSeconds();
                result = Nyear + "-" + Nmonth + "-" + Ndate;
            }
            return result;
        }
    }
}

export default commonJs;