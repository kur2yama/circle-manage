<template>
  <transition name="bounce">
    <div class="comment-detail" v-if="show">
      <div class="user-info">
        <div class="avatar" v-if="info.thumb">
          <van-image
              fit="cover"
              :src="info.thumb"
              loading-icon="contact"
              error-icon="contact"
          />
        </div>
        <div class="author">
          <span class="user-name">{{info.nickname}}</span>
          <span class="timed">{{info.created_at}}</span>
        </div>
      </div>
      <div class="comment-content">
        {{info.content}}
      </div>
      <div class="forum-content" v-if="info.topic_info" @click="jumpToDetail(info.topic_info)">
        <van-image
            v-if="info.topic_info.topic_type == '2'"
            class="forum-thumb"
            fit="cover"
            :src="info.topic_info.attachment[0].url"
        />
        <div class="forum-info">
          <span class="user-name">@{{info.topic_info.nickname}}</span>
          <span class="title">{{info.topic_info.content}}</span>
        </div>
      </div>


      <div class="operate-wrap">
        <span v-if="info.is_audit=='-2' || info.is_audit=='-3' || info.is_audit=='0'" @click.stop="operateHandler('fail')">不通过</span>
        <span class="plain" v-if="info.is_audit=='-2' || info.is_audit=='-3' || info.is_audit=='0'" @click.stop="operateHandler('pass')">通过</span>
        <span class="plain" v-if="info.is_audit=='1'" @click.stop="operateHandler('offline')">下线</span>
        <span v-if="info.is_audit=='1' || info.is_audit=='-4'" @click.stop="operateHandler('del')">删除</span>
        <span class="plain" v-if="info.is_audit=='-4'" @click.stop="operateHandler('restore')">重审</span>
      </div>
    </div>
  </transition>
</template>
<script>
import { getCommentApi ,postCommentApi } from '../api/post';
import Header from '../components/header/Header'
export default {
  name: "commentDetail",
  props:{
    show:{
      default:false,
      type:Boolean
    }
  },
  components: {
    Header
  },
  data(){
    return{
      info:{}
    }
  },
  mounted(){

  },
  methods:{
    init(topicid,replyid){
      this.info = {};
      if(!topicid || !replyid) return;
      let params = {
        action:"detail",
        topic_id:topicid,
        reply_id:replyid
      }
      getCommentApi(params).then(res=>{
        if(res.state){
          this.info = res.data.detail;
          this.$forceUpdate();
        }else{
          this.$toast(res.error || '请求失败');
        }
      }).catch(error => {
        console.log(error)
      })
    },
    operateHandler(action){
      if(this.isLoading) return;
      let tips,message;
      switch(action){
        case 'pass':
          tips = '确认通过'
          message = '是否确认通过评论'
          break;
        case 'fail':
          tips = '确认驳回'
          message = '是否确认驳回评论'
          break;
        case 'restore':
          tips = '确认重审'
          message = '是否确认重审评论'
          break;
        case 'del':
          tips = '确认删除'
          message = '是否确认删除评论'
          break;
        case 'offline':
          tips = '确认下线'
          message = '是否确认下线评论'
          break;
      }
      this.$dialog.confirm({
        title: tips,
        message: message,
      }).then(() => {
        let params = {
          raction: action=='offline'?'restore':action,
          action:'multi',
          data:this.info.id
        }
        this.isLoading = true;
        postCommentApi(params).then(res=>{
          this.isLoading = false;
          if(res.state){
            this.$toast('操作成功');
            setTimeout(()=>{
              this.$emit('back');
            },500)
          }else{
            this.$toast(res.error || '请求失败');
            if(res.info == 301 || res.info == 302){
              setTimeout(()=>{
                this.$emit('back');
              },500)
            }
          }
        }).catch(error => {
          this.isLoading = false;
          console.log(error)
        })
      }).catch(() => {
        // on cancel
      });
    },
    jumpToDetail(info){
      if(mc.isClient()){
        let url = `${location.origin}/#/sharedetail/${info.topic_id}`;
        mc.pushLinkViewController(url,'帖子详情')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.comment-detail{
  padding:0 0.16rem 1.5rem;
  position: fixed;
  top:0.48rem;
  left:0;
  right:0;
  bottom:0;
  height:100vh;
  color:#2b2b2b;
  z-index:120;
  background:#ffffff;
  overflow-y: auto;
  -webkit-overflow-scrolling : touch;
  .user-info{
    margin-top: 0.2rem;
    height:0.4rem;
    display: flex;
    align-items: center;
    .avatar{
      width:0.32rem;
      height:0.32rem;
      border-radius: 50%;
      overflow: hidden;
      /deep/ .van-icon-contact {
        font-size:0.2rem;
      }
      .van-image{
        width:100%;
        height:100%;
      }
    }
    .author{
      margin-left: 0.1rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .user-name{
        font-size:0.13rem;
      }
      .timed{
        color:#999999;
        font-size:0.1rem;
      }
    }
  }
  .comment-content{
    margin-top:0.12rem;
    line-height:0.21rem;
    color:#222222;
    font-size:0.15rem;
  }
  .forum-content{
    margin-top: 0.2rem;
    display: flex;
    align-items: center;
    height:0.97rem;
    border-top:0.01rem solid #d8d8d8;
    border-bottom:0.01rem solid #d8d8d8;
    .forum-thumb{
      width:0.75rem;
      height:0.57rem;
      border-radius: 0.06rem;
      overflow: hidden;
    }
    .forum-info{
      margin-left: 0.12rem;
      height:0.57rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .user-name{
        width:2.4rem;
        font-size: 0.15rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .title{
        width:2.4rem;
        color:#999999;
        font-size:0.14rem;
        font-weight:400;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  .operate-wrap{
    width:100%;
    padding:0 0.16rem;
    position:fixed;
    bottom:0.4rem;
    left:0;
    display:flex;
    justify-content: space-between;
    span{
      width:1.63rem;
      height: 0.48rem;
      line-height: 0.48rem;
      border-radius:0.06rem;
      border: 1px solid #E84048;
      text-align:center;
      color:#E84048;
      background:#ffffff;
      font-size:0.17rem;
      &.plain{
        background:#E84048;
        border: 0;
        color:#ffffff;
      }
    }
  }
}

.bounce-enter-active {
  animation: bounce-in .4s;
}
.bounce-leave-active {
  animation: bounce-in .3s reverse;
}
@keyframes bounce-in {
  0% {
    top:100%;
  }
  100% {
    top:0;
  }
}
</style>