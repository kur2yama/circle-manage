<template>
  <div class="share-detail" :class="{'is-android-style':isAndroidStyle()}">
    <Header :opacity="isVideo"  :headInfo="headInfo" :isAvater="!isVideo"/>
    <!--视频详情-->
    <div class="video-detail-wrapper" @click="videoTap($event)" v-if="isVideo">
      <vue-aliplayer-v2
          class="aliplayer"
          :source="source"
          ref="VueAliplayerV2"
          :options="options"
      />
      <div class="side-react-wrap">
        <div class="side-item collect-panel">
          <i></i>
          <span>收藏</span>
        </div>
        <div class="side-item digg-panel">
          <i></i>
          <span>{{info.digg | limitNumber}}</span>
        </div>
        <div class="side-item comment-panel" @click.stop="panelHandler('comment')">
          <i></i>
          <span>评论</span>
        </div>
        <div class="side-item share-panel">
          <i></i>
          <span>分享</span>
        </div>
      </div>
      <div class="comment-react-wrap" @click.stop="commentInputTap()">
        <el-input
            disabled
            type="text"
            v-model="commentInput"
            placeholder="喜欢就写个评论支持下吧~"
        >
          <i slot="prefix" class="el-input__icon el-icon-edit-outline"></i>
        </el-input>
      </div>
    </div>
    <!--视频详情评论面板-->
    <van-action-sheet class="video-comment-sheet" v-model="showCommentPanel" :title="commentPanelTitle">
      <div class="comment-sheet-wrap">
        <div class="empty" v-if="commentList && commentList.length==0"></div>
        <div class="comment-sheet-input">
          <div class="comment-sheet-input-container">写评论</div>
        </div>
        <ul class="comment-list" v-infinite-scroll="getTopicCommentList">
          <li class="main-comment" v-for="(comment,i) in commentList">
            <div class="avater">
              <van-image
                  width="0.35rem"
                  height="0.35rem"
                  fit="cover"
                  :src="comment.passport.img_url"
                  loading-icon="contact"
                  error-icon="contact"
              />
            </div>
            <div class="content">
              <div class="nickname">{{comment.passport.nickname}}</div>
              <div class="text">{{comment.content}}</div>
              <div class="main-bot">
                <div class="main-bot-left">
                  <span class="timed">{{comment.create_time | filterTime}}·{{comment.ip_location || '未知'}}</span>
                  <span class="reply-btn">回复</span>
                </div>
                <div class="main-bot-right">
                  <span class="icon-digg">{{comment.support_count | limitNumber}}</span>
                  <span class="icon-comment">{{comment.reply_count | limitNumber}}</span>
                </div>
              </div>
              <!--回复列表-->
              <ul class="reply-list" v-if="comment.comments && comment.comments.length>0">
                <li class="reply-item"  v-for="(reply,idx) in comment.comments" v-show="(comment.isUnfolded != 'undefined' && comment.isUnfolded) || idx<1">
                  <div class="reply-avater">
                    <van-image
                        width="0.2rem"
                        height="0.2rem"
                        fit="cover"
                        :src="reply.passport.img_url"
                        loading-icon="contact"
                        error-icon="contact"
                    />
                  </div>
                  <div class="reply-content">
                    <div class="reply-nickname">
                      <span class="replyer">{{reply.passport.nickname}}</span>
                      <i class="icon-arrow-right"></i>
                      <span class="author">{{reply.replyed_passport.nickname}}</span>
                    </div>
                    <div class="reply-text">{{reply.content}}</div>
                    <div class="reply-bot">
                      <span class="timed">{{comment.create_time | filterTime}}·{{comment.ip_location || '未知'}}</span>
                      <span class="reply-btn">回复</span>
                    </div>
                  </div>
                </li>
                <span class="unfold" v-if="comment.comments && comment.comments.length>1" :class="{'is-unfolded':comment.isUnfolded}" @click="commentFold(comment)">
                  {{comment.isUnfolded?'收起':'展开'}}
                  <i class="el-icon-arrow-down"></i>
                </span>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </van-action-sheet>

    <!--图片详情-->
    <div class="picture-detail-wrapper" v-if="!isVideo">
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
      <div class="article-comment-list" >
        <div class="comment-list-title">评论</div>
        <ul class="comment-list" v-infinite-scroll="getTopicCommentList" v-if="commentList && commentList.length>0">
          <li class="main-comment" v-for="(comment,i) in commentList">
            <div class="avater">
              <van-image
                  width="0.35rem"
                  height="0.35rem"
                  fit="cover"
                  :src="comment.passport.img_url"
                  loading-icon="contact"
                  error-icon="contact"
              />
            </div>
            <div class="content">
              <div class="nickname">
                <span>{{comment.passport.nickname}}</span>
                <span class="icon-digg">{{ comment.support_count | limitNumber }}</span>
              </div>
              <div class="text">{{comment.content}}</div>
              <div class="main-bot">
                <div class="main-bot-left">
                  <span class="timed">{{comment.create_time | filterTime}}·{{comment.ip_location || '未知'}}</span>
                  <span class="reply-btn">回复</span>
                </div>
              </div>
              <!--回复列表-->
              <ul class="reply-list" v-if="comment.comments && comment.comments.length>0">
                <li class="reply-item" v-for="(reply,idx) in comment.comments" v-show="(comment.isUnfolded != 'undefined' && comment.isUnfolded) || idx<1">
                  <div class="reply-avater">
                    <van-image
                        width="0.24rem"
                        height="0.24rem"
                        fit="cover"
                        :src="reply.passport.img_url"
                        loading-icon="contact"
                        error-icon="contact"
                    />
                  </div>
                  <div class="reply-content">
                    <div class="reply-nickname">
                      <span class="replyer">{{reply.passport.nickname}}</span>
                      <i class="icon-arrow-right"></i>
                      <span class="author">{{reply.replyed_passport.nickname}}</span>
                    </div>
                    <div class="reply-text">{{reply.content}}</div>
                    <div class="reply-bot">
                      <span class="timed">{{comment.create_time | filterTime}}·{{comment.ip_location || '未知'}}</span>
                      <span class="reply-btn">回复</span>
                    </div>
                  </div>
                </li>
                <span class="unfold" v-if="comment.comments && comment.comments.length>1" :class="{'is-unfolded':comment.isUnfolded}" @click="commentFold(comment)">
                  {{comment.isUnfolded?'收起':'展开'}}
                  <i class="el-icon-arrow-down"></i>
                </span>
              </ul>
            </div>
          </li>
        </ul>
        <div class="empty" v-if="commentList && commentList.length==0"></div>
      </div>
    </div>

  </div>
</template>

<script>
import { getFrontTopicDetailsApi,getFrontTopicCommentApi } from '../api/post';
import clientConfig from '../utils/clientConfig'
import commonJs from '../utils/common'
import Header from '../components/header/Header'
import VueAliplayerV2 from "vue-aliplayer-v2";
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import { ImagePreview } from 'vant';
import "swiper/dist/css/swiper.css"
export default {
  name: 'ShareDetail',
  mixins:[clientConfig,commonJs],
  components: {
    Header,
    VueAliplayerV2,
    swiper,
    swiperSlide,
    [ImagePreview.Component.name]: ImagePreview.Component,
  },
  data(){
    return{
      isVideo:false,
      options:{
        source: "",//https://res.cjyun.org/t/common/app/demo.mp4
        // height:'calc(100vh - 1rem)',
        height:'100vh',
        cover:'',
        x5_video_position:'top',
        x5_type:'h5',
        controlBarVisibility:'always',
        preload:true
      },
      commentInput:'',
      source:'',
      showCommentPanel:false,
      commentPanelTitle:'评论',
      commentListParams:{
        page:1,
        pagesize:20,
        total_page:1
      },
      // commentList:[
      //   {
      //     "content": "这也太厉害，给你点一个大大的赞！！！这也太厉害，给你点一个大大的赞！！！",
      //     "create_time": 1680576335,
      //     "ip": "47.97.91.79",
      //     "ip_location": "加拿大",
      //     "from": "",
      //     "attachments": [],
      //     "reply_id": 0,
      //     "support_count": 15226,
      //     "oppose_count": 0,
      //     "reply_count": 0,
      //     "report_count": "0",
      //     "is_ignore": "0",
      //     "comment_vest_id": "0",
      //     "comment_library_id": "0",
      //     "state": "1",
      //     "comments": [],
      //     "replyed_passport": {
      //       "nickname": ".*.*",
      //       "img_url": "",
      //       "user_id": 0,
      //       "level": null
      //     },
      //     "comment_id": 996,
      //     "passport": {
      //       "nickname": "135***382",
      //       "img_url": "https://fuss10.elemecdn.com/3/28/bbf893f792f03a54408b3b7a7ebf0jpeg.jpeg",
      //       "user_id": 369,
      //       "level": {
      //         "id": "1",
      //         "name": "步兵",
      //         "icon_url": "http://res.cjyun.test/assets/resource/level/level0.png",
      //         "name_color": "#999999"
      //       }
      //     },
      //     "top": false,
      //     "score": 0,
      //     "metadata": ""
      //   },
      //   {
      //     "content": "测试回复:大熊猫(学名：Ailuropoda melanoleuca)：属于熊科、大熊猫属的哺乳动物。仅有二个亚种。雄性个体稍大于雌性",
      //     "create_time": 1680576319,
      //     "ip": "47.97.91.79",
      //     "ip_location": "加拿大",
      //     "from": "",
      //     "attachments": [],
      //     "reply_id": 0,
      //     "support_count": 0,
      //     "oppose_count": 0,
      //     "reply_count": 1,
      //     "report_count": "0",
      //     "is_ignore": "0",
      //     "comment_vest_id": "0",
      //     "comment_library_id": "0",
      //     "state": "1",
      //     "comments": [
      //       {
      //         "content": "测试回复的回复:猫熊、竹熊、银狗、洞尕、杜洞尕、执夷、貊、猛豹、食铁兽",
      //         "create_time": 1680576641,
      //         "ip": "47.97.91.79",
      //         "ip_location": "加拿大",
      //         "from": "",
      //         "attachments": [],
      //         "reply_id": 995,
      //         "support_count": 0,
      //         "oppose_count": 0,
      //         "reply_count": 0,
      //         "report_count": "0",
      //         "is_ignore": "0",
      //         "comment_vest_id": "0",
      //         "comment_library_id": "0",
      //         "state": "1",
      //         "replyed_passport": {
      //           "nickname": "135***382",
      //           "img_url": "",
      //           "user_id": 369,
      //           "level": {
      //             "id": "1",
      //             "name": "步兵",
      //             "icon_url": "http://res.cjyun.test/assets/resource/level/level0.png",
      //             "name_color": "#999999"
      //           }
      //         },
      //         "comment_id": 997,
      //         "passport": {
      //           "nickname": "47.97.*.*",
      //           "img_url": "https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg",
      //           "user_id": 333,
      //           "level": null
      //         },
      //         "comments": [],
      //         "top": false,
      //         "score": 0,
      //         "metadata": ""
      //       },
      //       {
      //         "content": "测试回复的回复:保护级别易危(VU)IUCN标准、《中国国家重点保护野生动物名录》一级",
      //         "create_time": 1680576641,
      //         "ip": "47.97.91.79",
      //         "ip_location": "加拿大",
      //         "from": "",
      //         "attachments": [],
      //         "reply_id": 995,
      //         "support_count": 0,
      //         "oppose_count": 0,
      //         "reply_count": 0,
      //         "report_count": "0",
      //         "is_ignore": "0",
      //         "comment_vest_id": "0",
      //         "comment_library_id": "0",
      //         "state": "1",
      //         "replyed_passport": {
      //           "nickname": "135***382",
      //           "img_url": "",
      //           "user_id": 369,
      //           "level": {
      //             "id": "1",
      //             "name": "步兵",
      //             "icon_url": "http://res.cjyun.test/assets/resource/level/level0.png",
      //             "name_color": "#999999"
      //           }
      //         },
      //         "comment_id": 997,
      //         "passport": {
      //           "nickname": "47.97.*.*",
      //           "img_url": "https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg",
      //           "user_id": 333,
      //           "level": null
      //         },
      //         "comments": [],
      //         "top": false,
      //         "score": 0,
      //         "metadata": ""
      //       }
      //     ],
      //     "replyed_passport": {
      //       "nickname": ".*.*",
      //       "img_url": "",
      //       "user_id": 0,
      //       "level": null
      //     },
      //     "comment_id": 995,
      //     "passport": {
      //       "nickname": "135***382",
      //       "img_url": "https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg",
      //       "user_id": 369,
      //       "level": {
      //         "id": "1",
      //         "name": "步兵",
      //         "icon_url": "http://res.cjyun.test/assets/resource/level/level0.png",
      //         "name_color": "#999999"
      //       }
      //     },
      //     "top": false,
      //     "score": 0,
      //     "metadata": ""
      //   },
      //   {
      //     "content": "测试回复:大熊猫已在地球上生存了至少800万年，被誉为“活化石”和“中国国宝”即国兽，世界自然基金会的形象大使，是世界生物多样性保护的旗舰物种。截至2021年1月，中国大熊猫野生种群增至1864只。",
      //     "create_time": 1680576319,
      //     "ip": "47.97.91.79",
      //     "ip_location": "加拿大",
      //     "from": "",
      //     "attachments": [],
      //     "reply_id": 0,
      //     "support_count": 0,
      //     "oppose_count": 0,
      //     "reply_count": 1,
      //     "report_count": "0",
      //     "is_ignore": "0",
      //     "comment_vest_id": "0",
      //     "comment_library_id": "0",
      //     "state": "1",
      //     "comments": [
      //       {
      //         "content": "测试回复的回复:大熊猫的历史可谓源远流长。迄今所发现的最古老大熊猫成员——始熊猫的化石出土于中国云南禄丰和元谋两地，地质年代约为800万年前中新世晚期。在长期严酷的生存竞争和自然选择中，和它们同时代的很多动物都已灭绝，但大熊猫却是强者，处于优势，生存至今成为“活化石”。",
      //         "create_time": 1680576641,
      //         "ip": "47.97.91.79",
      //         "ip_location": "加拿大",
      //         "from": "",
      //         "attachments": [],
      //         "reply_id": 995,
      //         "support_count": 0,
      //         "oppose_count": 0,
      //         "reply_count": 0,
      //         "report_count": "0",
      //         "is_ignore": "0",
      //         "comment_vest_id": "0",
      //         "comment_library_id": "0",
      //         "state": "1",
      //         "replyed_passport": {
      //           "nickname": "135***382",
      //           "img_url": "",
      //           "user_id": 369,
      //           "level": {
      //             "id": "1",
      //             "name": "步兵",
      //             "icon_url": "http://res.cjyun.test/assets/resource/level/level0.png",
      //             "name_color": "#999999"
      //           }
      //         },
      //         "comment_id": 997,
      //         "passport": {
      //           "nickname": "47.97.*.*",
      //           "img_url": "https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg",
      //           "user_id": 333,
      //           "level": null
      //         },
      //         "comments": [],
      //         "top": false,
      //         "score": 0,
      //         "metadata": ""
      //       },
      //       {
      //         "content": "中国人对熊猫的认识由来已久，早在文字产生初期就记载了熊猫的各种称谓。《书经》称貔，《毛诗》称白罴（pi），《峨眉山志》称貔貅，《兽经》称貉，李时珍的《本草纲目》称貘，等等",
      //         "create_time": 1680576641,
      //         "ip": "47.97.91.79",
      //         "ip_location": "加拿大",
      //         "from": "",
      //         "attachments": [],
      //         "reply_id": 995,
      //         "support_count": 0,
      //         "oppose_count": 0,
      //         "reply_count": 0,
      //         "report_count": "0",
      //         "is_ignore": "0",
      //         "comment_vest_id": "0",
      //         "comment_library_id": "0",
      //         "state": "1",
      //         "replyed_passport": {
      //           "nickname": "135***382",
      //           "img_url": "",
      //           "user_id": 369,
      //           "level": {
      //             "id": "1",
      //             "name": "步兵",
      //             "icon_url": "http://res.cjyun.test/assets/resource/level/level0.png",
      //             "name_color": "#999999"
      //           }
      //         },
      //         "comment_id": 997,
      //         "passport": {
      //           "nickname": "47.97.*.*",
      //           "img_url": "https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg",
      //           "user_id": 333,
      //           "level": null
      //         },
      //         "comments": [],
      //         "top": false,
      //         "score": 0,
      //         "metadata": ""
      //       }
      //     ],
      //     "replyed_passport": {
      //       "nickname": ".*.*",
      //       "img_url": "",
      //       "user_id": 0,
      //       "level": null
      //     },
      //     "comment_id": 995,
      //     "passport": {
      //       "nickname": "135***382",
      //       "img_url": "https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg",
      //       "user_id": 369,
      //       "level": {
      //         "id": "1",
      //         "name": "步兵",
      //         "icon_url": "http://res.cjyun.test/assets/resource/level/level0.png",
      //         "name_color": "#999999"
      //       }
      //     },
      //     "top": false,
      //     "score": 0,
      //     "metadata": ""
      //   }
      // ],
      commentList:[],
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
        location:'',
        topic_id:'',
        digg:''
      },
      headInfo:{
        avater:'',
        name:''
      }
    }
  },
  mounted(){
    this.$store.dispatch('changePageOn','sharedetail')
    this.getDetailInfo();
  },
  filters:{
    limitNumber(val){
      return Number(val)>=10000?`${(val/10000).toFixed(1)}w+`:val
    }
  },
  methods:{
    play() {
      this.$refs.VueAliplayerV2.play();
    },
    pause() {
      this.$refs.VueAliplayerV2.pause();
    },
    replay() {
      this.$refs.VueAliplayerV2.replay();
    },
    getCurrentTime() {
      this.$refs.VueAliplayerV2.getCurrentTime();
    },
    getStatus() {
      const status = this.$refs.VueAliplayerV2.getStatus();
    },
    videoTap(e){
      const status = this.$refs.VueAliplayerV2.getStatus();
      console.log(status)
      if(status =='ready' || status =='pause'){
        this.$refs.VueAliplayerV2.play();
      }else if(status =='playing'){
        this.$refs.VueAliplayerV2.pause();
      }
    },
    // 获取帖子详情
    getDetailInfo(){
      let params = {
        action:'detail',
        topic_id:this.$route.params.id
      }
      getFrontTopicDetailsApi(params).then(res=>{
        if(res.state){
          this.info.topic_id = res.data.topic_id;
          this.info.topic_type = res.data.topic_type;
          this.info.tag_name = res.data.tag_name;
          this.info.location = res.data.location;
          this.info.content = res.data.content;
          this.info.digg = res.data.digg;
          this.headInfo = {
            avatar:res.data.thumb,
            name:res.data.nickname
          };
          if(this.info.topic_type == '2'){
            this.info.banner = res.data.attachment;
          }else if(this.info.topic_type == '3'){
            this.isVideo = true;
            this.options.source = res.data.attachment.video;
            this.options.cover = res.data.attachment.thumb.url;
          }
          this.$forceUpdate();
        }
      }).catch(err=>{
        console.log(err)
      })
    },
    // 获取帖子评论列表
    getTopicCommentList(isFlash){
      console.log('more')
      if(this.isLoading) return;
      if((this.commentListParams.page > this.commentListParams.total_page)&&!isFlash) return;
      if(isFlash){ this.commentListParams.page = 1 };
      let params = {
        action:'list',
        topic_id:this.$route.params.id,
        page:this.commentListParams.page,
        pagesize:this.commentListParams.pagesize
      }
      this.isLoading = true;
      getFrontTopicCommentApi(params).then(res=>{
        this.isLoading = false;
        if(res.state){
          this.commentList = isFlash?res.data.comments:[...this.commentList,...res.data.comments];
          this.commentListParams.page++;
          this.commentListParams.total_page = res.data.total_page;
          if(res.data.cmt_sum && res.data.cmt_sum>0){
            this.commentPanelTitle = `${res.data.cmt_sum}条评论`
          }else{
            this.commentPanelTitle = '评论'
          }
        }else{
          this.$toast(res.error || '请求错误!');
        }
      }).catch(error => {
        this.isLoading = false;
        console.log(error)
      })
    },
    commentInputTap(){
      console.log(1123)
    },
    // 视频详情评论弹框
    panelHandler(type){
      if(type == 'comment'){
        this.showCommentPanel = true;
        this.getTopicCommentList(true);
      }
    },
    imagePreview(index){
      if(!this.info.banner) return;
      let imageList = [];
      this.info.banner.map(i=>{
        imageList.push(i.url)
      })
      ImagePreview({images:imageList,closeable: true,startPosition: index });
    },
    commentFold(comment){
      comment.isUnfolded = comment.isUnfolded?false:true;
      console.log(comment)
      this.$forceUpdate();
    }
  }
}
</script>
<style lang="less" scoped>
.share-detail{
  //视频详情
  .video-detail-wrapper{
    height:100vh;
    background:#000000;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    .aliplayer{
      //margin-top: 0.48rem;
      width:100%;
      //height:calc(100vh - 1.48rem);
      //max-height:calc(100vh - 1.48rem);
      height: 100vh;
      /deep/ .prism-big-play-btn{
        left:50%!important;
        bottom:50%!important;
        transform: translate(-50%,-50%);
        width:0.64rem;
        height:0.64rem;
        background: url('../assets/images/icon_play.png') no-repeat center/100%;
        opacity: 0.5;
        .outter{
          display: none;
        }
      }
      /deep/ .prism-controlbar{
        height:0.45rem;
        bottom:0.9rem!important;
        .prism-controlbar-bg{
          display: none;
        }
      }
      /deep/ .prism-play-btn{
        display: none;
      }
      /deep/ .prism-time-display{
        display: none;
      }
      /deep/ .prism-fullscreen-btn{
        display: none;
      }
      /deep/ .prism-cc-btn{
        display: none;
      }
      /deep/ .prism-setting-btn{
        display: none;
      }
      /deep/ .prism-volume{
        display: none;
      }
      /deep/ .prism-progress{
        width:calc(100% - 0.5rem);
        bottom:0.2rem!important;
        margin:0 0.25rem;
        height:0.05rem;
        background:none!important;
        background:rgba(216,216,216,0.29)!important;
        border-radius: 0.03rem;
        .prism-controlbar-bg{
          display: none!important;
        }
        .prism-progress-loaded{
          height:0.05rem;
          border-radius: 0.03rem;
          background:rgba(216,216,216,0.15)!important;
        }
        .prism-progress-played{
          height:0.05rem;
          background: rgba(216, 216, 216, 0.85) !important;
          border-radius: 0.03rem;
          &::after{
            content:'';
            display: block;
            width:0.13rem;
            height:0.13rem;
            position:absolute;
            top:50%;
            right:-0.06rem;
            transform: translateY(-50%);
            background: rgba(216, 216, 216, 1);
            border-radius: 50%;
          }
        }
        .prism-progress-cursor{
          display: none!important;
        }
      }
    }
    .side-react-wrap{
      position: fixed;
      top:50%;
      right:0.15rem;
      transform: translateY(-50%);
      width:0.34rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index:999;
      .side-item{
        display: flex;
        flex-direction: column;
        align-items: center;
        opacity:0.8;
        &:not(:first-child){
          margin-top: 0.24rem;
        }
        i{
          width:0.28rem;
          height:0.3rem;
        }
        &.collect-panel{
          i{
            background:url('../assets/images/icon_collect.png') no-repeat center/100%;
          }
        }
        &.digg-panel{
          i{
            background:url('../assets/images/icon_digg.png') no-repeat center/100%;
          }
        }
        &.comment-panel{
          i{
            background:url('../assets/images/icon_comment.png') no-repeat center/100%;
          }
        }
        &.share-panel{
          i{
            background:url('../assets/images/icon_share.png') no-repeat center/100%;
          }
        }
        span{
          margin-top: 0.08rem;
          font-size:0.13rem;
          height:0.2rem;
          line-height: 0.2rem;
          color:#ffffff;
        }
      }
    }
    .comment-react-wrap{
      position: fixed;
      bottom:0.50rem;
      left:50%;
      transform: translateX(-50%);
      width:3.43rem;
      height:0.36rem;
      .el-input{
        width: 100%;
        height: 100%;
        /deep/ .el-input__inner{
          width: 100%;
          height: 100%;
          line-height: 0.36rem;
          outline: 0!important;
          border:0!important;
          border-radius: 0.36rem;
          background:rgba(243,243,245,0.18);
          font-size:0.14rem;
          padding-left:0.50rem;
          opacity:1!important;
          &::-webkit-input-placeholder{
            color:rgba(248, 247, 247, 0.99);;
          }
          &::-moz-placeholder{
            color:rgba(248, 247, 247, 0.99);;
          }
          &::-ms-input-placeholder{
            color:rgba(248, 247, 247, 0.99);;
          }
        }
        /deep/ .el-icon-edit-outline{
          font-size:0.22rem;
          width:0.40rem;
          line-height: 0.36rem;
          color: rgba(248, 247, 247, 0.99);
        }
      }
    }
  }
  //视频评论弹框
  .video-comment-sheet{
    .comment-sheet-input{
      padding:0 0.16rem;
      position:absolute;
      bottom:0;
      left: 0;
      width:100%;
      height:0.82rem;
      background:#ffffff;
      z-index:99;
      border-top:0.01rem solid #f5f5f5;
      .comment-sheet-input-container{
        margin-top: 0.11rem;
        padding:0 0.43rem;
        width:3.43rem;
        height:0.36rem;
        line-height: 0.36rem;
        border-radius:0.18rem;
        color:#666666;
        font-size:0.15rem;
        background: url('../assets/images/icon_vol.png') no-repeat 0.17rem center/0.18rem,url('../assets/images/icon_face.png') no-repeat 3.1rem center/0.22rem ,#f3f3f5;

      }
    }
    .van-action-sheet__content{
      height: 6rem;
      overflow: hidden;
    }
  }
  .comment-sheet-wrap{
    height: 6rem;
    overflow: hidden;
    .comment-list{
      padding:0 0.16rem 0.82rem;
      height: 6rem;
      overflow-x: hidden;
      overflow-y:auto;
      .main-comment{
        margin: 0.15rem 0 0.1rem;
        display: flex;
        justify-content: space-between;
        .avater{
          width:0.35rem;
          height:0.35rem;
          border-radius:0.35rem;
          overflow: hidden;
          /deep/ .van-icon-contact{
            font-size:0.18rem;
          }
        }
        .content{
          flex:1;
          margin-left: 0.1rem;
          .nickname{
            height: 0.14rem;
            line-height: 0.14rem;
            font-weight: 400;
            font-size:0.13rem;
            color:#666666;
          }
          .text{
            margin-top: 0.05rem;
            color:#000000;
            font-size:0.14rem;
            font-weight: 400;
            line-height: 0.18rem;
          }
          .main-bot{
            margin-top: 0.05rem;
            height:0.24rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .main-bot-left{
              font-size:0.13rem;
              .timed{
                color:#999999;
                font-weight:400;
              }
              .reply-btn{
                margin-left: 0.05rem;
                color:#333333;
                font-weight: 500;
              }
            }
            .main-bot-right{
              display: flex;
              align-items: center;
              color:#999999;
              font-size:0.13rem;
              .icon-digg{
                padding-left: 0.16rem;
                background: url("../assets/images/icon_list_digg.png") no-repeat center left/0.12rem;
              }
              .icon-comment{
                margin-left: 0.16rem;
                padding-left: 0.16rem;
                background: url("../assets/images/icon_list_comment.png") no-repeat center left/0.12rem;
              }
            }
          }
          .reply-list{
            margin-top: 0.12rem;
            .unfold{
              margin-top: 0.05rem;
              padding:0 0.2rem;
              display: flex;
              align-items: center;
              justify-content: center;
              width:0.42rem;
              color:#999999;
              font-weight: 500;
              font-size:0.12rem;
              text-align: center;
              position:relative;
              &::after{
                content:'';
                display: block;
                width:0.16rem;
                height:0.01rem;
                background:#D8D8D8;
                position:absolute;
                top:50%;
                left:0;
                transform: translateY(-50%);
              }
              &::before{
                content:'';
                display: block;
                width:0.16rem;
                height:0.01rem;
                background:#D8D8D8;
                position:absolute;
                top:50%;
                right:0;
                transform: translateY(-50%);
              }
              .el-icon-arrow-down{
                transition:0.3s all;
                font-weight: 550;
              }
              &.is-unfolded{
                .el-icon-arrow-down{
                  transform: rotate(180deg);
                }
              }
            }
            .reply-item{
              margin-top: 0.05rem;
              display: flex;
              .reply-avater{
                width: 0.2rem;
                height: 0.2rem;
                overflow: hidden;
                border-radius: 0.2rem;
              }
              .reply-content{
                flex:1;
                margin-left: 0.09rem;
                .reply-nickname{
                  display: flex;
                  align-items: center;
                  font-weight: 400;
                  color: #666666;
                  font-size:0.13rem;
                  .icon-arrow-right{
                    margin:0 0.08rem;
                    width:0.05rem;
                    height:0.08rem;
                    background: url('../assets/images/icon_arrow_right.png') no-repeat center/100%;
                  }
                }
                .reply-text{
                  margin-top: 0.05rem;
                  font-size: 0.14rem;
                  font-weight: 400;
                  color: #000000;
                }
                .reply-bot{
                  margin-top: 0.05rem;
                  display: flex;
                  align-items: center;
                  height:0.24rem;
                  font-size:0.13rem;
                  .timed{
                    color: #999999;
                    font-weight: 400;
                  }
                  .reply-btn{
                    margin-left: 0.05rem;
                    color: #333333;
                    font-weight: 500;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  //图片详情
  .picture-detail-wrapper{
    padding-top:0.48rem;
    height:100vh;
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
    .article-comment-list{
      margin:0.2rem 0.16rem 0;
      border-top:0.01rem solid #EBEBEB;
      .comment-list-title{
        margin-top: 0.2rem;
        width:0.56rem;
        //height:0.24rem;
        line-height: 0.24rem;
        text-align:center;
        background: #FF8C50;
        color:#ffffff;
        font-size:0.14rem;
        border-radius: 0px 0.12rem 0.12rem 0px;
      }
      .comment-list{
        .main-comment{
          margin-top: 0.2rem;
          padding-bottom:0.2rem;
          display: flex;
          justify-content: space-between;
          &:not(:last-child){
            border-bottom:0.01rem solid #F2F2F2;
          }
          .avater{
            width:0.35rem;
            height:0.35rem;
            border-radius:0.35rem;
            overflow: hidden;
            /deep/ .van-icon-contact{
              font-size:0.18rem;
            }
          }
          .content{
            flex:1;
            margin-left: 0.1rem;
            .nickname{
              display: flex;
              align-items: center;
              justify-content: space-between;
              height: 0.14rem;
              line-height: 0.14rem;
              font-weight: 400;
              font-size:0.13rem;
              color:#666666;
              .icon-digg{
                color:#999999;
                min-width:0.14rem;
                padding-right: 0.14rem;
                background: url("../assets/images/icon_list_digg.png") no-repeat top right/0.12rem;
              }
            }
            .text{
              margin-top: 0.1rem;
              color:#000000;
              font-size:0.13rem;
              font-weight: 400;
              line-height: 0.18rem;
            }
            .main-bot{
              margin-top: 0.05rem;
              height:0.24rem;
              display: flex;
              justify-content: space-between;
              align-items: center;
              .main-bot-left{
                font-size:0.12rem;
                display: flex;
                align-items: center;
                .timed{
                  color:#999999;
                  font-weight:400;
                }
                .reply-btn{
                  width:0.42rem;
                  height: 0.2rem;
                  line-height: 0.2rem;
                  background: #F2F2F2;
                  border-radius: 0.1rem;
                  margin-left: 0.2rem;
                  color:#666666;
                  text-align: center;
                  font-size: 0.11rem;
                }
              }
              .main-bot-right{
                display: flex;
                align-items: center;
                color:#999999;
                font-size:0.13rem;
                .icon-digg{
                  min-width:0.16rem;
                  padding-left: 0.16rem;
                  background: url("../assets/images/icon_list_digg.png") no-repeat center left/0.12rem;
                }
                .icon-comment{
                  margin-left: 0.16rem;
                  padding-left: 0.16rem;
                  background: url("../assets/images/icon_list_comment.png") no-repeat center left/0.12rem;
                }
              }
            }
            .reply-list{
              margin-top: 0.12rem;
              padding: 0.12rem;
              background: #F2F2F2;
              border-radius: 6px;
              .unfold{
                display: flex;
                align-items: center;
                justify-content: center;
                margin-top: 0.05rem;
                width:0.42rem;
                color:#E84048;
                font-size:0.12rem;
                .el-icon-arrow-down{
                  transition:0.3s all;
                }
                &.is-unfolded{
                  .el-icon-arrow-down{
                    transform: rotate(180deg);
                  }
                }
              }
              .reply-item{
                &:not(:first-child){
                  margin-top:0.05rem;
                }
                display: flex;
                .reply-avater{
                  width: 0.24rem;
                  height: 0.24rem;
                  overflow: hidden;
                  border-radius: 0.2rem;
                }
                .reply-content{
                  flex:1;
                  margin-left: 0.09rem;
                  .reply-nickname{
                    display: flex;
                    align-items: center;
                    font-weight: 400;
                    color: #999999;
                    font-size:0.13rem;
                    .icon-arrow-right{
                      margin:0 0.08rem;
                      width:0.05rem;
                      height:0.08rem;
                      background: url('../assets/images/icon_arrow_right.png') no-repeat center/100%;
                    }
                  }
                  .reply-text{
                    margin-top: 0.05rem;
                    font-size: 0.13rem;
                    font-weight: 400;
                    color: #222222;
                  }
                  .reply-bot{
                    margin-top:0.05rem;
                    display: flex;
                    align-items: center;
                    height:0.24rem;
                    font-size:0.12rem;
                    .timed{
                      color: #999999;
                      font-weight: 400;
                    }
                    .reply-btn{
                      margin-left: 0.1rem;
                      color: #222222;
                      font-weight: 400;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  .my-swipe .van-swipe-item {
    color: #fff;
    font-size: 20px;
    line-height: 150px;
    text-align: center;
    background-color: #39a9ed;
  }
  .empty{
    margin:0.5rem auto;
    width:2.4rem;
    height:1.2rem;
    background:url('../assets/images/empty1.png') center/100% no-repeat;
  }
  &.is-android-style{
    .picture-detail-wrapper{
      padding-top:0.78rem;
    }
  }
}
</style>