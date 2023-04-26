<template>
<!--  <transition name="bounce">-->
    <div class="article-detail" v-if="show">
        <div class="swiper-wrap" v-if="info.topic_type == '2' && info.banner">
          <swiper ref="mySwiper" :options="swiperOptions">
            <swiper-slide
                v-for="item in info.banner"
                :key="item.id"
                @click="imagePreview()"
            >
              <img :src="item.url" alt="">
            </swiper-slide>
            <div class="swiper-pagination" slot="pagination"></div>
          </swiper>
        </div>
        <div class="content-wrap">
          <div class="topic" v-if="info.tag_name">#{{info.tag_name}}#</div>
          <div class="text" v-if="info.content" v-html="info.content"></div>
        </div>
        <div class="position-wrap" v-if="info.location">
          <span>{{info.location}}</span>
        </div>
        <div class="operate-wrap">
          <span v-if="info.state=='0'" @click.stop="operateHandler('fail')">驳回</span>
          <span v-if="info.state=='0'" class="plain" @click.stop="operateHandler('pass')">通过</span>
          <span v-if="info.state=='1'" @click.stop="operateHandler('offline')">下线</span>
          <span v-if="info.state=='1'" class="plain">置顶</span>
          <span v-if="info.state=='2'" @click.stop="operateHandler('restore')">重审</span>
          <span v-if="info.state=='2'" class="plain" @click.stop="operateHandler('del')">删除</span>
        </div>
        <!--驳回/下线理由弹框-->
        <van-dialog v-model="isReasonDialog" title="驳回/下线理由" show-cancel-button :before-close="rejectBeforeHandler" @confirm="rejectHandler()">
            <div class="reason-select-input" @click="isReasonSelect = true" :class="{'had':reasonId}">
              {{reasonId?reasonText:'请选择驳回或下线理由'}}
              <i class="el-icon-arrow-down"></i>
            </div>
            <div class="reason-select-textarea" v-show="reasonId == 15">
              <el-input
                  type="textarea"
                  :rows="3"
                  placeholder="请描述其他理由"
                  v-model="reasonTextarea">
              </el-input>
            </div>
        </van-dialog>

        <!--理由选项动作框-->
        <van-action-sheet v-model="isReasonSelect">
          <van-picker
              title="选择分类"
              show-toolbar
              :columns="reasonOptions"
              @confirm="onConfirmSelectReason"
              @cancel="isReasonSelect = false"
          />
        </van-action-sheet>


    </div>
<!--  </transition>-->
</template>
<script>
import { getCircleApi,postCircleApi } from '../api/post';
import Header from '../components/header/Header'
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import { ImagePreview } from 'vant';
import "swiper/dist/css/swiper.css"
export default {
  name: "ArticleDetail",
  props:{
    show:{
      default:false,
      type:Boolean
    }
  },
  components: {
    Header,
    swiper,
    swiperSlide,
    [ImagePreview.Component.name]: ImagePreview.Component,
  },
  data(){
    return{
      swiperOptions: {
        loop:false,
        autoplay:{
          delay:3000,
          stopOnLastSlide:false
        },
        pagination: {
          el: '.swiper-pagination',    //与slot="pagination"处 class 一致
          clickable: true,            //轮播按钮支持点击
        },
        navigation:{
          nextEl:'.swiper-button-next',
          prevEl:'.swiper-button-prev'
        },
        on:{
          click:(e)=>{
            let swiper = this.$refs.mySwiper.swiper;
            this.imagePreview(swiper.clickedIndex);
          }
        }
      },
      info:{
        banner:[],
        content:'',
        topic_type:'',
        tag_name:'',
        ip:'',
        topic_id:'',
        state:'',
        location:''
      },
      isLoading:false,
      reasonOptions:[{id:1,text:'违法违禁'},{id:2,text:'色情'},{id:3,text:'低俗'},{id:4,text:'赌博诈骗'},{id:5,text:'血腥暴力'},{id:6,text:'人身攻击'},{id:7,text:'不良封面/标题'},{id:8,text:'引战'},{id:9,text:'青少年不良信息'},{id:10,text:'涉政谣言'},{id:11,text:'涉社会事件谣言'},{id:12,text:'虚假不实信息'},{id:13,text:'疫情谣言'},{id:14,text:'侵权申诉'},{id:15,text:'其他问题'}],
      isReasonDialog:false,
      isReasonSelect:false,
      action:'',
      reasonText:'',
      reasonId:'',
      reasonTextarea:''

    }
  },
  mounted(){

  },
  methods:{
    init(topicid){
      this.info = {};
      if(!topicid) return;
      let params = {
        action:"detail",
        topic_id:topicid
      }
      getCircleApi(params).then(res=>{
        if(res.state){
          // topic_type 1文字 2图片 3视频
          this.info.topic_type = res.data.topic_type;
          this.info.tag_name = res.data.tag_name;
          this.info.content = res.data.content;
          this.info.topic_id = res.data.topic_id;
          this.info.state = res.data.state;
          this.info.location = res.data.location;
          if(this.info.topic_type = '2'){
            this.info.banner = res.data.attachment;
          }
          this.$forceUpdate();
        }
      }).catch(error => {
        console.log(error)
      })
    },
    imagePreview(index){
      if(!this.info.banner) return;
      let imageList = [];
      this.info.banner.map(i=>{
        imageList.push(i.url)
      })
      ImagePreview({images:imageList,closeable: true,startPosition: index });
    },
    operateHandler(action){
      if(this.isLoading) return;
      let tips,message;
      this.action = action;
      switch(action){
        case 'pass':
          tips = '确认通过'
          message = '是否确认通过帖子'
          break;
        case 'fail':
          // tips = '确认驳回'
          // message = '是否确认驳回帖子'
          this.isReasonDialog = true;
          return;
          break;
        case 'restore':
          tips = '确认重审'
          message = '是否确认重审帖子'
          break;
        case 'del':
          tips = '确认删除'
          message = '是否确认删除帖子'
          break;
        case 'offline':
          // tips = '确认下线'
          // message = '是否确认下线帖子'
          this.isReasonDialog = true;
          return;
          break;
      }
      this.$dialog.confirm({
        title: tips,
        message: message,
      }).then(() => {
        let params = {
          action: action,
          topic_id: this.info.topic_id
        }
        this.isLoading = true;
        postCircleApi(params).then(res=>{
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
    onConfirmSelectReason(select){
      this.reasonId = select.id;
      this.reasonText = select.text;
      this.isReasonSelect = false;
    },
    rejectBeforeHandler(action,done){
      if(action === 'confirm'){
        if(!this.reasonId){
          this.$toast('请选择理由');
          done(false);
          return;
        }else{
          if(this.reasonId == 15 && !this.reasonTextarea){
            this.$toast('请填写其他理由');
            done(false);
            return;
          }
          done();
        }
      }else{
        done();
      }
    },
    rejectHandler(){
      if(!this.reasonId){
        return;
      }else{
        if(this.reasonId == 15 && !this.reasonTextarea){
          return;
        }
      }
      let params = {
        action: this.action,
        topic_id: this.info.topic_id,
        reason:this.reasonId==15?this.reasonTextarea:this.reasonText
      }

      this.isLoading = true;
      postCircleApi(params).then(res=>{
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
    }
  }
}
</script>

<style lang="less" scoped>
.article-detail{
  padding-bottom: 1.5rem;
  position: fixed;
  top:0.48rem;
  left:0;
  right:0;
  height:100%;
  color:#2b2b2b;
  z-index:120;
  background:#ffffff;
  overflow-y: auto;
  -webkit-overflow-scrolling : touch;
  .swiper-wrap{
    height:3.1rem;
    .swiper-container{
      height:3.1rem;
      .swiper-wrapper{
        height:100%;
        .swiper-slide{
          height:2.8rem;
          img{
            width:100%;
            height:2.8rem;
            object-fit: cover;
          }
        }
      }
      .swiper-pagination{
        height:0.2rem;
        bottom:0!important;
        display:flex;
        align-items: center;
        justify-content: center;
        /deep/ .swiper-pagination-bullet{
          width:0.05rem;
          height:0.05rem;
          transition: 0.3s all;
          &.swiper-pagination-bullet-active{
            background:#E84048;
            width:0.08rem;
            height:0.08rem;
          }
        }
      }
    }
  }
  .content-wrap{
    margin-top: 0.1rem;
    padding:0 0.16rem;
    .topic{
      color:#4E72AA;
      font-weight:500;
      font-size:0.15rem;
      line-height: 0.24rem;
    }
    .text{
      margin-top: 0.05rem;
      font-weight: 500;
      font-size:0.15rem;
      line-height: 0.24rem;
      color:#222222;
    }
  }
  .position-wrap{
    margin-top: 0.14rem;
    padding:0 0.16rem;
    height: 0.24rem;
    display: flex;
    align-items: center;
    span{
      padding:0 0.15rem 0 0.3rem;
      height: 0.24rem;
      line-height: 0.24rem;
      border-radius: 0.1rem;
      font-size:0.12rem;
      font-weight:400;
      color:#666666;
      background-image:url("../assets/images/icon_pos.png") ;
      background-repeat:no-repeat;
      background-position: 0.08rem center;
      background-color:#f2f2f2;
      background-size:0.16rem auto;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
  .reason-select-input{
    padding:0 0.40rem 0 0.15rem;
    margin:0.2rem auto;
    width:calc(100% - 0.4rem);
    height:0.36rem;
    line-height: 0.36rem;
    border: 0.01rem solid #dcdfe6;
    border-radius: 0.04rem;
    font-size: 0.14rem;
    color:#c0c4cc;
    position:relative;
    &.had{
      color:#666666;
    }
    .el-icon-arrow-down{
      position:absolute;
      width:0.16rem;
      height:0.16rem;
      top:0.1rem;
      right:0.1rem;
      font-size:0.16rem;
      color:#c0c4cc;
    }
  }
  .reason-select-textarea{
    margin:0 auto 0.2rem;
    width:calc(100% - 0.4rem);
  }
}

.my-swipe .van-swipe-item {
  color: #fff;
  font-size: 20px;
  line-height: 150px;
  text-align: center;
  background-color: #39a9ed;
}

.bounce-enter-active {
  animation: bounce-in .3s;
}
.bounce-leave-active {
  animation: bounce-in .3s reverse;
}
@keyframes bounce-in {
  0% {
    left:100%;
  }
  100% {
    left:0;
  }
}
</style>