<template>
  <div class="header-wrapper" :class="{'opacity':opacity,'topics':isTopicDetails ,'is-android-style':isAndroidStyle()}">
    <span v-if="!isShowAvatar && !opacity && !isAvater" >{{ title }}</span>
    <div class="avatar-wrap" v-if="isShowAvatar || isAvater">
      <div class="avatar">
        <van-image
            width="0.32rem"
            height="0.32rem"
            fit="cover"
            :src="headInfo.avatar"
            loading-icon="contact"
            error-icon="contact"
        />
      </div>
      <div class="user-name">{{headInfo.name}}</div>
    </div>
    <van-icon name="arrow-left" @click="back()" />
    <i class="el-icon-search" v-if="isSearch" @click="toSearch()"></i>
    <i class="el-icon-more" v-if="isTopicDetails" @click="showSharePanel()"></i>
    <i class="icon-share" v-if="isTopicDetails"></i>
  </div>
</template>

<script>
import clientConfig from '../../utils/clientConfig'
export default {
  name: 'Header',
  mixins:[clientConfig],
  components: {

  },
  props:{
    // 头部用户信息
    headInfo:{
      type:Object,
      default:()=>{

      }
    },
    // 透明底
    opacity:{
      type:Boolean,
      default:false
    },
    // 是否显示头部用户信息
    isAvater:{
      type:Boolean,
      default:false
    },
    isSearch:{
      type:Boolean,
      default:false
    },
    // 话题详情页
    isTopicDetails:{
      type:Boolean,
      default:false
    }
  },
  data(){
    return{
      title:'',
      isShowAvatar:false,
      isAndroid:false
    }
  },
  mounted(){
    mc.hideNativeTop();
  },
  methods:{
    back(){
      switch(this.$store.state.pageon){
        case 'home':
          mc.closeCurrentPage()
          break;
        case 'article':
          this.$router.push({path:'/'});
          break;
        case 'comment':
          this.$router.push({path:'/'});
          break;
        case 'topic':
          this.$router.push({path:'/'});
          break;
        case 'topicset':
          this.$router.push({path:'/topic'});
          break;
        case 'articleDetail':
          this.$emit('backHandler');
          break;
        case 'commentDetail':
          this.$emit('backHandler');
          break;
        case 'topicviews':
          this.$router.go(-1);
          break;
        case 'sharedetail':
          if(mc.isClient()){
            mc.closeCurrentPage();
          }else{
            this.$router.go(-1);
          }
          break;
        case 'topiclist':
          if(mc.isClient()){
            mc.closeCurrentPage();
          }else{
            this.$router.go(-1);
          }
          break;
        case 'topicdetails':
          if(mc.isClient()){
            mc.closeCurrentPage();
          }else{
            this.$router.go(-1);
          }
          break;
        case 'puretopiclist':
          if(mc.isClient()){
            mc.closeCurrentPage();
          }else{
            this.$router.go(-1);
          }
          break;
        default:
          this.$router.go(-1)
      }
    },
    toSearch(){
      this.$emit('searchHandler');
    },
    showSharePanel(){
      this.$emit('moreHandler')
    }
  },
  watch:{
    "$store.state.pageon":{
      handler(nval,oval){
        this.isShowAvatar = false;
        switch(nval){
          case 'home':
            this.title = '审核'
            break;
          case 'article':
            this.title = '帖子审核'
            break;
          case 'comment':
            this.title = '评论审核'
            break;
          case 'topic':
            this.title = '话题管理'
            break;
          case 'articleDetail':
            this.isShowAvatar = true
            break;
          case 'commentDetail':
            this.title = '评论'
            break;
          case 'topicset':
            this.title = '话题配置'
            break;
          case 'topicview':
            this.title = ''
            break;
          case 'sharedetail':
            this.title = ''
            break;
          case 'topiclist':
            this.title = '话题列表'
            break;
          case 'topicdetails':
            this.title = ''
            break;
          case 'puretopiclist':
            this.title = '相关搜索'
            break;
          default:;
        }
      },
      immediate:true
    }
  }
}
</script>
<style lang="less" scoped>
.header-wrapper{
  padding:0 0.48rem;
  position:fixed;
  top:0;
  left:0;
  width:100%;
  height:0.48rem;
  line-height: 0.48rem;
  background:#ffffff;
  font-size: 0.16rem;
  text-align: center;
  font-weight: 600;
  color:#222222;
  z-index:99;
  &.topics{
    padding:0 0.78rem 0 0.48rem;
  }
  .van-icon-arrow-left{
    position:absolute;
    top:0;
    left:0;
    width:0.48rem;
    height:0.48rem;
    line-height: 0.48rem;
    text-align: center;
    font-size:0.20rem;
  }
  .el-icon-search{
    position:absolute;
    top:0;
    right:0;
    width:0.48rem;
    height:0.48rem;
    line-height: 0.48rem;
    text-align: center;
    font-size:0.20rem;
  }
  .el-icon-more{
    position:absolute;
    top:0;
    right:0;
    width:0.48rem;
    height:0.48rem;
    line-height: 0.48rem;
    text-align: center;
    font-size:0.20rem;
    color:#ffffff;
  }
  .icon-share{
    position:absolute;
    top:0;
    right:0.48rem;
    width:0.30rem;
    height:0.48rem;
    background:url('../../assets/images/icon_share_line.png') no-repeat center/0.24rem;
  }
  &.opacity{
    background: none;
    .van-icon-arrow-left{
      color:#ffffff;
    }
  }
  .avatar-wrap{
    width:100%;
    height:0.48rem;
    display: flex;
    align-items: center;
    .avatar{
      width:0.32rem;
      height:0.32rem;
      overflow: hidden;
      border-radius:50%;
      /deep/ .van-icon-contact {
        font-size:0.18rem;
      }
    }
    .user-name{
      font-weight: normal;
      font-size:0.13rem;
      margin-left: 0.1rem;
    }
  }
  &.is-android-style{
    padding-top:0.3rem;
    height: 0.78rem;
    .van-icon-arrow-left{
      top:0.3rem;
    }
    .el-icon-search{
      top:0.3rem;
    }
    .el-icon-more{
      top:0.3rem;
    }
    .icon-share{
      top:0.3rem;
    }
  }
}
</style>