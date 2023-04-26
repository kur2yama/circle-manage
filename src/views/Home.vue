<template>
  <div class="home" :class="{'is-android-style':isAndroidStyle()}">
    <Header />
    <ul class="manage-home-wrapper">
      <li @click="jump('Article')">
        <span class="title">
          帖子审核
        </span>
        <div class="arrow">
          <span class="nums">{{topicNum}}</span>
          <van-icon name="arrow" />
        </div>
      </li>
      <li @click="jump('Comment')">
        <span class="title tab2">
          评论审核
        </span>
        <div class="arrow">
          <span class="nums">{{replyNum}}</span>
          <van-icon name="arrow" />
        </div>
      </li>
      <li @click="jump('Topic')">
        <span class="title tab3">
          话题管理
        </span>
        <div class="arrow">
          <span class="nums"></span>
          <van-icon name="arrow" />
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { getCircleAuditApi } from '../api/post';
import clientConfig from '../utils/clientConfig'
import commonJs from '../utils/common'
import Header from '../components/header/Header'
export default {
  name: 'Home',
  mixins:[clientConfig,commonJs],
  components: {
    Header
  },
  data(){
    return{
      userInfo:{},
      topicNum:0,
      replyNum:0
    }
  },
  mounted(){
    // this.checkClinet();
    this.$store.dispatch('changePageOn','home')
    this.getInfo();
  },
  methods:{
    checkClinet(){
      if(mc.isClient()){
        mc.userGetInfo((res)=>{
          if(res.state=='1'){
            mc.userGetEncryptInfo((rep)=>{
              this.userInfo = rep.data;
              this.$store.dispatch('saveUserInfo',rep.data);
              // todo
            })
          }else{
            mc.userLogin(()=>{
              mc.userGetEncryptInfo((resp)=>{
                this.userInfo = resp.data;
                this.$store.dispatch('saveUserInfo',resp.data);
                // todo
              })
            });
          }
        })
      }else{
        // this.$dialog.alert({
        //   message: '请于云上系列客户端打开链接',
        //   theme: 'round-button',
        // }).then(() => {
        //   let params = '{"contentid":"","appid":12,"siteid":"10125","url":"https://m-xiangyang.cjyun.org//huodong/usercenter-group/#/","type":1}'
        //   let url = 'xiangyang://newsdetail?params=' + encodeURIComponent(params)
        //   this.openApp(url,this.goConfirmAddr)
        // });
      }
    },
    jump(route){
      this.$router.push({name:route}).catch(err=>{
        console.log(err)
      })
    },
    getInfo(){
      let params = {
        action:"list",
        page:"1",
        state:"1"
      }
      getCircleAuditApi(params).then(res=>{
        if(res.state){
          this.topicNum = res.data.topic;
          this.replyNum = res.data.reply;
        }
      }).catch(error => {
        console.log(error)
      })
    }
  }
}
</script>
<style lang="less" scoped>
.home{
  padding-top:0.44rem;
  width:100%;
  min-height:100vh;
  background:#ffffff;
  color:#222222;
  font-size:0.16rem;
  .manage-home-wrapper{
    margin:0 0.16rem;
    li{
      height:0.6rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
      &:not(:last-of-type){
        border-bottom:0.01rem solid #EBEBEB;
      }
      .title{
        padding-left:0.48rem;
        line-height:0.6rem;
        background:url('../assets/images/icon_home_1.png') no-repeat left center/0.32rem;
        &.tab2{
          background:url('../assets/images/icon_home_2.png') no-repeat left center/0.32rem;
        }
        &.tab3{
          background:url('../assets/images/icon_home_3.png') no-repeat left center/0.32rem;
        }
      }
      .arrow{
        height:0.6rem;
        display: flex;
        align-items: center;
        .nums{
          font-size:0.15rem;
          font-weight: normal;
          color:#999999;
        }
      }
    }
  }
  &.is-android-style{
    padding-top: 0.78rem;
  }
}
</style>