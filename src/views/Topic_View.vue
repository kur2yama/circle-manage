<template>
  <div class="topic-view" :class="{'is-android-style':isAndroidStyle()}">
    <Header :opacity="true"/>
    <div class="topic-info">
      <div class="background" :style="'background:url(' + info.image +') no-repeat center/100%'"></div>
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
      </div>
    </div>
    <div class="intro-wrap">
      {{info.intro}}
    </div>
    <div class="editor-wrap" @click="toEdit()">编辑</div>
  </div>
</template>
<script>
import { getTagApi } from '../api/post';
import clientConfig from '../utils/clientConfig'
import commonJs from '../utils/common'
import Header from '../components/header/Header'
import { ImagePreview } from 'vant';
import "swiper/dist/css/swiper.css"
export default {
  name: "Topic_View",
  mixins:[clientConfig,commonJs],
  props:{

  },
  components: {
    Header,
    [ImagePreview.Component.name]: ImagePreview.Component,
  },
  data(){
    return{
      info:{
        image:'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg'
      }
    }
  },
  mounted(){
    this.$store.dispatch('changePageOn','topicviews');
    if(!this.$route.query.id){
      this.$toast('话题不存在');
      setTimeout(()=>{
        this.$router.push({name:'Topic_View'});
      },1000)
    }else{
      this.getInfo();
    }
  },
  methods:{
    getInfo(){
      let params ={
        action:'detail',
        tag_id:this.$route.query.id
      }
      getTagApi(params).then(res=>{
        if(res.state){
          this.info = res.data.detail;
        }
      }).catch(err=>{
        console.log(err)
      })
    },
    toEdit(){
      this.$router.push({name:'Topic_Set',query:{id:this.info.id}});
    }
  }
}
</script>

<style lang="less" scoped>
.topic-view{
  .topic-info{
    position:relative;
    height:1.93rem;
    .background{
      position:absolute;
      top:0;
      left:0;
      width:100%;
      height:100%;
      object-fit: cover;
      -webkit-filter: blur(0.01rem);
      -moz-filter: blur(0.01rem);
      -o-filter: blur(0.01rem);
      filter: blur(0.01rem);
      overflow: hidden;
    }
    .topic-info-wrap{
      padding:0 0.16rem;
      width:100%;
      height:0.57rem;
      position:absolute;
      top:50%;
      left:50%;
      transform: translate(-50%,-50%);
      display: flex;
      align-items: center;
      .image{
        width:0.57rem;
        height:0.57rem;
        border-radius: 0.04rem;
        overflow: hidden;
      }
      .topic-text{
        min-height:0.57rem;
        margin-left:0.15rem;
        flex:1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .title{
          color:#ffffff;
          font-size:0.17rem;
        }
        .topic-trends{
          display: flex;
          align-items: center;
          color:#ffffff;
          font-size:0.12rem;
          span{
            margin-right: 0.1rem;
          }
        }
      }
    }
  }
  .intro-wrap{
    padding:0.1rem 0.16rem 0.4rem;
    height:calc(100vh - 1.93rem);
    line-height: 0.20rem;
    font-size:0.14rem;
    font-weight: 400;
    color: #666666;
    background:#ffffff;
  }
  .editor-wrap{
    position:fixed;
    bottom:0.52rem;
    left:50%;
    transform: translateX(-50%);
    width:3.4rem;
    height:0.48rem;
    line-height: 0.48rem;
    text-align: center;
    background: #E84048;
    color:#ffffff;
    font-size:0.18rem;
    border-radius: 0.06rem;
  }
  &.is-android-style{
    .topic-info-wrap{
      top:60%;
    }
  }
}
</style>