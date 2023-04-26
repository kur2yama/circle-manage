<template>
  <div class="topic-details">
    <Header :opacity="true" :isTopicDetails="true" @moreHandler="moreHandler"/>
    <div class="topic-banner-wrapper" :style="'backgroundImage:url('+ info.image +')'">
      <div class="topic-info-wrap">
        <div class="image">
          <van-image
              width="0.57rem"
              height="0.57rem"
              fit="cover"
              :src="info.image"
          />
        </div>
        <div class="topic-text">
          <div class="title">#{{info.tag}}#</div>
          <div class="topic-trends">
            <span>{{info.onlooker}}人围观</span>
            <span>{{info.num}}动态</span>
          </div>
        </div>
        <div class="topic-observed" :class="{'observed':info.is_attentions == 1}">
          <van-icon name="success" v-if="info.is_attentions == 1" />
          <van-icon name="plus" v-else />
          <span @click="subscribeTopic(info)">{{info.is_attentions == 1?'已关注':'关注'}}</span>
        </div>
      </div>
      <div class="topic-intro-wrap" :class="{fold:introFold}">
        <i class="icon-intro"></i>
        <span class="intro">{{info.intro}}</span>
        <van-icon  name="arrow-down" @click="introFold = !introFold"/>
      </div>
    </div>
    <!--帖子列表-->
    <ul class="topic-list-wrapper" v-infinite-scroll="getList">
      <li class="topic-items" v-for="(topic,i) in listData" @click="viewDetails(topic)">
        <div class="user-panel">
          <div class="avater">
            <van-image
                width="0.32rem"
                height="0.32rem"
                fit="cover"
                :src="topic.thumb"
                loading-icon="contact"
                error-icon="contact"
            />
          </div>
          <div class="user-info">
            <span class="user-name">{{topic.nickname || '匿名'}}</span>
            <span class="timed">{{topic.created_at}}</span>
          </div>
          <div @click.stop="subscribeUp(topic)" class="user-observed" :class="{'observed':topic.attention == 1}"></div>
        </div>
        <div class="content-panel">
          <span class="tag-name">#{{topic.tag_name}}#</span>
          {{topic.content}}
        </div>
        <div class="source-panel">
          <!--单图-->
          <div class="single-picture" v-if="topic.topic_type == '2' && topic.attachment && topic.attachment.length==1">
            <van-image
                fit="cover"
                :src="topic.attachment[0].url"
            />
          </div>
          <!--多图-->
          <ul class="multiple-picture" v-if="topic.topic_type == '2' && topic.attachment && topic.attachment.length>1">
            <li v-for="(image,x) in topic.attachment" v-if="x<2">
              <van-image
                  fit="cover"
                  :src="image.url"
              />
            </li>
          </ul>
          <!--单视频-->
          <div class="single-video" v-if="topic.topic_type == '3' && topic.attachment && topic.attachment.thumb">
            <i class="icon-play"></i>
            <van-image
                fit="cover"
                :src="topic.attachment.thumb.url"
            />
          </div>
        </div>
        <ul class="interactive-panel">
          <li class="share">转发</li>
          <li class="comment">评论</li>
          <li class="digg">{{topic.digg}}</li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
import { getFrontTagApi , postFrontTagApi ,getFrontTopicListApi ,postFrontCommonApi} from '../api/post';
import clientConfig from '../utils/clientConfig'
import commonJs from '../utils/common'
import Header from '../components/header/Header'
export default {
  name: 'TopicDetails',
  mixins:[clientConfig,commonJs],
  components: {
    Header
  },
  data(){
    return{
      isLoading:false,
      listData:[],
      listParams:{
        page:1,
        pagesize:10,
        total_page:1
      },
      info:{
        image:'',
        tag:'',
        onlooker:0,
        num:0,
        intro:''
      },
      introFold:false
    }
  },
  mounted(){
    this.$store.dispatch('changePageOn','topicdetails');
    this.getInfo();
    this.getList();
  },
  methods:{
    getList(isFlash = false){
      console.log('more')
      if(this.isLoading) return;
      if((this.listParams.page > this.listParams.total_page)&&!isFlash) return;
      if(isFlash){ this.listParams.page = 1 };
      let params = {
        page:this.listParams.page,
        pagesize:10,
        action:'list',
        tagid:this.$route.params.id
      }
      this.isLoading = true;
      getFrontTopicListApi(params).then(res=>{
        this.isLoading = false;
        if(res.state){
          this.listData = isFlash?res.data.data:[...this.listData,...res.data.data];
          this.listParams.page++;
          this.listParams.total_page = res.data.total_page;
        }else{
          this.$toast(res.error || '请求错误!');
        }
      }).catch(error => {
        this.isLoading = false;
        console.log(error)
      })
    },
    getInfo(){
      let params = {
        action:'detail',
        tag_id:this.$route.params.id
      }
      getFrontTagApi(params).then(res=>{
        if(res.state){
          this.info = res.data.detail;
        }else{
          this.$toast(res.error || '请求错误!');
        }
      }).catch(error => {
        console.log(error)
      })
    },
    moreHandler(){
      if(mc.isClient()){
        mc.sharePanel({
          title:this.info.tag,
          content:this.info.intro,
          image:this.info.image,
          url:location.href
        })
      }else{
        // todo
      }
    },
    // 订阅话题
    subscribeTopic(info){
      if(this.isLoading) return;
      let params = {
        to_id:this.info.id,
        action:this.info.is_attentions == 1?'unsubscribe':'subscribe'
      }
      this.isLoading = true;
      postFrontTagApi(params).then(res=>{
        this.isLoading = false;
        if(res.state){
          this.getInfo();
        }else{
          this.$toast(res.error || '操作失败');
        }
      }).catch(err=>{
        this.isLoading = false;
        console.log(error)
      })
    },
    //订阅up主
    subscribeUp(topic){
      if(this.isLoading) return;
      let params = {
        to_member_id:topic.member_id,
        action:topic.attention == 1?'unsubscribe':'subscribe'
      }
      this.isLoading = true;
      postFrontCommonApi(params).then(res=>{
        this.isLoading = false;
        if(res.state){
          topic.attention = topic.attention==1?0:1;
          this.$forceUpdate();
        }else{
          this.$toast(res.error || '操作失败');
        }
      }).catch(err=>{
        this.isLoading = false;
        console.log(error)
      })
    },
    viewDetails(topic){
      if(mc.isClient()){
        let url = `${location.origin}/#/sharedetail/${topic.topic_id}`;
        mc.pushLinkViewController(url,'帖子详情')
      }else{
        this.$router.push({name:'ShareDetail',params:{id:topic.topic_id}});
      }
    }
  }
}
</script>
<style lang="less" scoped>
.topic-details{
  height:100vh;
  background:#ffffff;
  .topic-banner-wrapper{
    width:100%;
    height:2.33rem;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 100% auto;
    object-fit: cover;
    position:relative;
    &::before{
      content:'';
      display: block;
      width: 100%;
      height: 100%;
      position:absolute;
      top:0;
      left:0;
      background:linear-gradient(90deg, rgba(0,0,0,0.63) 0%, rgba(0,0,0,0.16) 100%);;
      z-index:9;
    }
    .topic-info-wrap{
      padding:0 0.16rem;
      width:100%;
      height:0.57rem;
      position:absolute;
      bottom:0.72rem;
      left:0;
      display: flex;
      align-items: center;
      z-index:10;
      .image{
        width:0.57rem;
        height:0.57rem;
        border-radius: 0.04rem;
        overflow: hidden;
      }
      .topic-text{
        width:1.8rem;
        height:0.57rem;
        margin:0 0.15rem;
        flex:1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .title{
          height: 0.24rem;
          color:#ffffff;
          font-size:0.17rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .topic-trends{
          display: flex;
          align-items: center;
          color:#ffffff;
          font-size:0.14rem;
          span{
            margin-right: 0.1rem;
          }
        }
      }
      .topic-observed{
        min-width:0.65rem;
        width:0.65rem;
        height:0.27rem;
        background: #FFFFFF;
        border-radius: 0.13rem;
        font-size: 0.12rem;
        font-weight:500;
        color:#E84048;
        display: flex;
        justify-content: center;
        align-items: center;
        .van-icon-plus{
          margin-right: 0.03rem;
          font-size:0.12rem;
          font-weight: 600;
        }
        span{
          height: 0.2rem;
          line-height: 0.2rem;
        }
        &.observed{
          background:#C9C9C9;
          color:#ffffff;
        }
      }
    }
    .topic-intro-wrap{
      padding:0.1rem 0.4rem;
      width:100%;
      position:absolute;
      top:1.93rem;
      left:0;
      border-radius:0.06rem 0.06rem 0 0;
      background:#ffffff;
      z-index:10;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      position:relative;
      border-bottom: 0.01rem solid #D8D8D8A1;
      .intro{
        height:0.2rem;
        color: #666666;
        font-size: 0.14rem;
        font-weight: 400;
        line-height: 0.2rem;
        overflow: hidden;
        word-break: break-all;
      }
      .van-icon-arrow-down{
        position:absolute;
        width:0.14rem;
        height:0.14rem;
        bottom:0.13rem;
        right:0.16rem;
        font-size:0.14rem;
        color:#E84048;
        &::before{
          transition: 0.3s all;
        }
      }
      .icon-intro{
        position:absolute;
        top:0.13rem;
        left:0.16rem;
        width:0.16rem;
        height:0.14rem;
        background:url('../assets/images/icon_intro.png') no-repeat center/100%;
      }
      &.fold{
        .intro{
          height:auto;
        }
        .van-icon-arrow-down{
          &::before{
            transform: rotate(-180deg);
          }
        }
      }
    }
  }
  .topic-list-wrapper{
    padding:0 0.16rem;
    width:100%;
    height:calc(100vh - 2.4rem);
    overflow-x: hidden;
    overflow-y: auto;
    .topic-items{
      padding:0.2rem 0 0.12rem;
      &:not(:last-child){
        border-bottom: 0.01rem solid #EBEBEB;
      }
      .user-panel{
        display: flex;
        height:0.4rem;
        justify-content: space-between;
        align-items: center;
        .avater{
          width:0.32rem;
          height:0.32rem;
          border-radius:50%;
          overflow: hidden;
          /deep/ .van-icon-contact{
            font-size: 0.24rem;
          }
        }
        .user-info{
          margin-left: 0.1rem;
          width:2rem;
          flex:1;
          display:flex;
          flex-direction: column;
          justify-content: space-between;
          .user-name{
            color:#222222;
            font-size:0.13rem;
            font-weight:500;
          }
          .timed{
            font-size:0.11rem;
            font-weight:400;
            color:#999999;
          }
        }
        .user-observed{
          width:0.65rem;
          height:0.27rem;
          background: url('../assets/images/icon_observer.png') no-repeat center/100%;
          &.observed{
            background: url('../assets/images/icon_observed.png') no-repeat center/100%;
          }
        }
      }
      .content-panel{
        margin-top: 0.2rem;
        max-height:0.48rem;
        line-height: 0.24rem;
        font-size:0.15rem;
        font-weight:500;
        color:#222222;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        .tag-name{
          color:#4E72AA;
          padding-right:0.1rem;
        }
      }
      .source-panel{
        .single-picture{
          margin-top: 0.2rem;
          width:2.35rem;
          height:3.14rem;
          border-radius:0.04rem;
          overflow: hidden;
          .van-image{
            width:100%;
            height:100%;
          }
        }
        .multiple-picture{
          margin-top: 0.2rem;
          display: flex;
          justify-content: space-between;
          li{
            width:1.1rem;
            height:1.1rem;
            border-radius:0.04rem;
            overflow: hidden;
            .van-image{
              width:100%;
              height:100%;
            }
          }
        }
        .single-video{
          margin-top: 0.2rem;
          position:relative;
          width:2.35rem;
          height:3.14rem;
          border-radius:0.04rem;
          overflow: hidden;
          .van-image{
            width:100%;
            height:100%;
          }
          .icon-play{
            display: block;
            position:absolute;
            top:50%;
            left:50%;
            transform: translate(-50%,-50%);
            width:0.24rem;
            height:0.24rem;
            background:url('../assets/images/icon_play_white.png') no-repeat center/100%;
            z-index:10;
          }
        }
      }
      .interactive-panel{
        margin-top: 0.12rem;
        height:0.24rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        li{
          padding-left:0.22rem;
          line-height: 0.24rem;
          color:#999999;
          font-size:0.14rem;
          font-weight:400;
          &.share{
            margin-left: 0.24rem;
            background:url('../assets/images/icon_content_share.png') no-repeat left center/0.17rem;
          }
          &.comment{
            background:url('../assets/images/icon_content_comment.png') no-repeat left center/0.18rem;
          }
          &.digg{
            margin-right: 0.24rem;
            padding-left:0.22rem;
            background:url('../assets/images/icon_content_digg.png') no-repeat left center/0.15rem;
          }
        }
      }
    }
  }
}
</style>