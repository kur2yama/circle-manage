<template>
    <!-- 登录模块-->
    <div
        class="loginDialog vertical-box"
        ontouchmove="return false"
        v-if="isShowLogin"
        v-cloak
    >
      <div id="login" class="loginBox vertical-middle">
        <span class="closeBtn" @click="isShowLogin = false"></span>
        <h3>
          <img
              src="http://img.cjyun.org/a/10008/202006/beb32c0428c602da9e88d3dd74c9c16f.png"
          />
          <span>登录长江云账号</span>
        </h3>
        <form onsubmit="return false">
          <div class="switchModeBtn" data-mode="0" @click="switchLoginMode()">
            {{ isMobile ? "账号密码登录" : "短信登录" }}
          </div>
          <!--密码登录 -->
          <div class="mode-normal" v-show="!isMobile">
            <div class="item">
              <input
                  class="tInput userId js_login_account"
                  type="text"
                  placeholder="邮箱/手机号"
                  autocomplete="off"
                  v-model="account"
              />
            </div>
            <div class="item">
              <input
                  class="tInput password js_login_password"
                  type="password"
                  placeholder="密码"
                  autocomplete="off"
                  v-model="password"
              />
            </div>
          </div>
          <!--短信登录 -->
          <div class="mode-code" v-show="isMobile">
            <div class="item">
              <input
                  class="tInput userId js_login_account_m"
                  type="text"
                  placeholder="手机号"
                  autocomplete="off"
                  v-model="mobile"
              />
            </div>
            <div class="item">
              <div class="captcha-wrapper">
                <input
                    class="tInput password js_login_captcha"
                    type="text"
                    placeholder="验证码"
                    maxlength="6"
                    autocomplete="off"
                    v-model="captchaCode"
                />
                <div
                    class="sendCaptcha disabled"
                    id="captcha-send-btn"
                    @click="sendCode()"
                >
                  发送验证码
                </div>
              </div>
            </div>
          </div>
          <!--图片验证码 -->
          <div class="img-captcha-shadow" v-if="isShowCaptcha"></div>
          <div
              class="img-captcha-box"
              id="img-captcha-box-sms"
              v-if="isShowCaptcha"
          >
            <div>
              <p class="captcha-title">
                请输入图片验证码
                <span
                    class="closeBtn"
                    id="captcha-close"
                    @click="closeCaptcha()"
                ></span>
              </p>
              <div class="input-group captcha">
                <input
                    type="text"
                    name="p-captcha"
                    id="p-captcha"
                    placeholder="验证码"
                    autocomplete="off"
                    v-model="captchaImgCode"
                />
                <div class="captcha-thumb">
                  <img
                      :src="captchaurl"
                      id="p-captcha-img"
                      alt=""
                      @click="flashCaptcha()"
                  />
                </div>
              </div>
              <p class="define" id="captcha-ssms-sure" @click="sureCaptcha()">
                确定
              </p>
            </div>
          </div>

          <div class="item">
            <a
                href="/index/login/password"
                class="fr goForgetPassword"
                target="_blank"
            >忘记密码</a
            >
          </div>
          <div class="item">
            <button
                v-if="isMobile"
                type="submit"
                class="submitBtn js_login_submit"
                :class="{ disable: !mobile || !captchaCode }"
                @click="login()"
            >
              登录
            </button>
            <button
                v-if="!isMobile"
                type="submit"
                class="submitBtn js_login_submit"
                :class="{ disable: !hasAccount || !hasPassword }"
                @click="login()"
            >
              登录
            </button>
          </div>
          <div class="item">
            <a :href="jumpUrl" class="fr registerBtn">还没账号？立即注册</a>
          </div>
        </form>
      </div>
    </div>
    <!-- 登录模块 end-->
</template>

<script>
import { postRateApi } from "../api/post";
import "../assets/css/login.css";
export default {
  name: "Login",
  props: {},
  data() {
    return {
      // 登录相关
      isMobile: true,
      sendtimer: null,
      sendflag: true,
      captchaCode: "",
      captchaImgCode: "",
      mobile: "",
      captchaurl: "/login/captcha",
      isShowCaptcha: false,
      account: "",
      password: "",
      hasAccount: false,
      hasPassword: false,
      hasMobile: false,
      hasCaptcha: false,
      isShowLogin: false,
      loginDisable: false,
      loginFlag: true,
      jumpUrl: `/index/login/regist?suburl=${encodeURIComponent(
          location.href
      )}`,
    };
  },
  mounted() {

  },
  watch: {
    account(n, o) {
      this.hasAccount = !n ? false : true;
    },
    password(n, o) {
      this.hasPassword = !n ? false : true;
    },
    mobile(n, o) {
      this.hasMobile = !n ? false : true;
    },
    captchaCode(n, o) {
      this.hasCaptcha = !n ? false : true;
    },
    isMobile(n, o) {
      if (n) {
        if (this.hasMobile && this.hasCaptcha) {
          this.loginDisable = true;
        } else {
          this.loginDisable = false;
        }
      } else {
        if (this.hasAccount && this.hasPassword) {
          this.loginDisable = true;
        } else {
          this.loginDisable = false;
        }
      }
    },
  },
  methods: {
    close() {
      this.isvisible = false;
    },
    // 判断环境
    checkClient(callback){
      if(mc.isClient()){
        var _this = this;
        mc.userGetInfo(res=>{
          if(res.state=='1'){
            mc.userGetEncryptInfo(rep=>{
              _this.$store.dispatch('saveUserInfo',rep.data);
            })
            _this.memberid = res.data.id;
            let userInfo = {
              nickname:res.data.nickname,
              thumb:res.data.avatar
            }
            if(callback) callback(userInfo);
          }else{
            _this.$store.dispatch('saveUserInfo', {});
            mc.userLogin(()=>{
              window.location.reload();
            });
          }
        })
      }else{
        this.getSite(callback)
      }
    },
    // 登录相关
    getSite(callback) {
      var _this = this;
      $.ajax({
        url: "/ajax/user",
        type: "GET",
        dataType: "json",
        success: function (res) {
          var oauthConfig = {
            mode: "public",
            appUrl: "http://app.cjyun.org", // APP站点的URL
            noticeUrl: "/index/login/notice", // 登录成功后，通知本站点登录的URL
            siteid: res.stateid,
          };
          window.oauth = window.Oauth(oauthConfig);
          if (res.state) {
            _this.memberid = res.user.memberid;
            let userInfo = {
              nickname:res.user.nickname,
              thumb:res.user.thumb
            }
            if(callback) callback(userInfo);
          }else{
            _this.isShowLogin = true;
          }
        },
        error: function (err) {
          console.log(err)
        },
      });
    },
    switchLoginMode() {
      this.isMobile = !this.isMobile;
      this.account = "";
      this.password = "";
      this.mobile = "";
      this.captchaCode = "";
    },
    // 点击发送验证码 -弹起图片验证码
    sendCode() {
      var _this = this;
      if (!_this.mobile || _this.mobile.length != 11) {
        alert("手机号格式错误");
        return false;
      }
      if (!_this.sendflag) return false;
      _this.flashCaptcha();
      _this.isShowCaptcha = true;
    },
    sendCodeFn() {
      var _this = this;
      var number = 60;
      var params = {
        mobile: _this.mobile,
        siteid: "10001",
        captcha:_this.captchaImgCode
      };
      _this.sendflag = false;
      clearTimeout(_this.sendtimer);
      _this.sendtimer = setInterval(function () {
        number--;
        if (number === 0) {
          clearInterval(_this.sendtimer);
          _this.sendtimer = null;
          _this.sendflag = true;
          $("#captcha-send-btn").html("发送验证码");
          return;
        }
        $("#captcha-send-btn").html(number + "s");
      }, 1000);
      _this.isShowCaptcha = false;
      _this.flashCaptcha();
      $.post("/login/sendsms", params, function (res) {
        if (!res.state) {
          _this.flashCaptcha();
          alert(res.error);
        }
      });
    },
    // 确定图片验证码
    sureCaptcha() {
      var _this = this;
      if (!_this.captchaImgCode) {
        alert("验证码不能为空");
        return;
      }
      _this.checkCaptchaCode();
    },
    checkCaptchaCode() {
      var _this = this;
      if (!_this.captchaImgCode) {
        alert("验证码不能为空");
        return;
      }
      var params = {
        captcha: _this.captchaImgCode,
      };
      $.post("/login/checkcaptcha", params, function (res) {
        if (res.state) {
          _this.sendCodeFn();
          _this.closeCaptcha();
        } else {
          alert(res.error);
        }
      });
    },
    // 刷新图片验证码
    flashCaptcha() {
      var url = "/login/captcha?_" + new Date().getTime();
      this.captchaurl = url;
    },
    closeCaptcha() {
      this.isShowCaptcha = false;
      this.captchaImgCode = "";
    },
    //h5提交登录
    login() {
      if (this.loginFlag) {
        this.loginFlag = false;
        var self = this;
        var reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        if (!self.isMobile) {
          var loginData = {
            account: this.account,
            password: this.password,
            remember: 0,
            type: reg.test(this.account) ? "email" : "mobile",
            _: new Date().getTime(),
            login_type: 0,
            need_https: 1,
          };
        } else {
          var loginData = {
            account: this.mobile,
            password: this.password,
            remember: 0,
            type: reg.test(this.mobile) ? "email" : "mobile",
            _: new Date().getTime(),
            code: this.captchaCode,
            login_type: 1,
            need_https: 1,
          };
        }
        $.ajax({
          url: "/index/login/cloud",
          type: "POST",
          data: loginData,
          success: function (res) {
            if (res.state) {
              self.isShowLogin = false;
              self.loginFlag = true;
              oauth.login(
                  res.data,
                  function (data) {
                    // 登录成功，通知本地后端登录
                    self.noticeLogin(data.noticeurl);
                  },
                  function (is_captcha, code, error) {}
              );
            }else{
              self.$notify({ type: 'danger', message: res.error});
            }
          },
        });
      }
    },
    //通知后端登录
    noticeLogin(url) {
      console.log(url)
      var _this = this;
      $.ajax({
        url: url,
        type: "POST",
        success:function(res){
          if(res.state){
            window.location.reload();
          }else{
            _this.$notify({ type: 'danger', message: '登陆失败'});
          }
        }
      })
    }
  }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>

</style>