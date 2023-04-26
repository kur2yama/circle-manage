<template>
  <div class="topic-search" :class="{'is-android-style':isAndroidStyle()}">
    <div class="search-wrapper">
      <van-icon name="arrow-left" @click="back()"/>
      <el-input @clear="isResult = false" @change="onsearch()" type="search" v-model="keywords" placeholder="请输入内容" :clearable="true" prefix-icon="el-icon-search"></el-input>
      <span class="cancel" @click="back()">取消</span>
    </div>
    <!--搜索历史-->
    <div class="topic-search-history" v-if="!isResult">
      <div class="topic-search-history-label">搜索历史</div>
      <ul>
        <li v-for="(his,i) in searchHistoryList" @click="historyClick(his)">{{his}}</li>
      </ul>
    </div>


    <!--搜索结果-->
    <div class="topic-list-wrapper" v-if="isResult" v-infinite-scroll="getList">
      <!--话题结果-->
      <li v-show="i<1" class="topic-types" v-for="(type,i) in listTypesData" @click="toDetails(type,'tag')" :class="{'noBotLine':listTypesData && listTypesData.length>1}">
        <div class="avatar-panel">
          <van-image
              width="0.50rem"
              height="0.50rem"
              fit="cover"
              :src="type.image"
          />
        </div>
        <div class="info-panel">
          <div class="topic-name" v-html="'#'+highlighter(type.tag)+'#'"></div>
          <div class="record">
            <span>{{type.onlooker}}人围观</span>
            <span>{{type.num}}人动态</span>
          </div>
        </div>
        <div class="observer-panel" @click.stop="observedHandler(type)"></div>
      </li>
      <div class="more-types" v-show="listTypesData && listTypesData.length>1">
        <i></i>
        <span @click="viewAllTags()">查看全部</span>
        <i></i>
      </div>
      <!--帖子结果-->
      <li class="topic-items" v-for="(topic,i) in listData" @click="toDetails(topic,'topic')">
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
          <span v-html="highlighter(topic.content)"></span>
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
    </div>
  </div>
</template>

<script>
import { getFrontTopicListApi } from '../api/post';
import clientConfig from '../utils/clientConfig'
import commonJs from '../utils/common'
import { getCookies ,setCookies ,removeCookies} from '../utils/Cookies';
export default {
  name: 'TopicSearch',
  mixins:[clientConfig,commonJs],
  components: {

  },
  data(){
    return{
      isLoading:false,
      isResult:false,//显示结果 / 显示历史
      isShowMoreTypes:false,
      listTypesData:[],//话题搜索结果
      listData:[],//帖子搜索结果
      listParams: {
        page: 1,
        pagesize: 10,
        total_page: 1
      },
      keywords:'',
      info:{
        image:'',
        tag:'',
        onlooker:0,
        num:0,
        intro:''
      },
      searchHistoryList:[]
    }
  },
  mounted(){
    this.$store.dispatch('changePageOn','topicsearch');
    this.searchHistoryList = getCookies('searchHistoryList')?JSON.parse(getCookies('searchHistoryList')):[];
    mc.hideNativeTop();
  },
  filters:{

  },
  methods:{
    getList(isFlash = false){
      if(this.isLoading) return;
      if(!this.keywords) return;
      if((this.listParams.page > this.listParams.total_page)&&!isFlash) return;
      if(isFlash){ this.listParams.page = 1 };
      let params = {
        page:this.listParams.page,
        pagesize:20,
        action:'search',
        keywords:this.keywords
      }
      if(this.searchHistoryList.indexOf(this.keywords)<0){
        this.searchHistoryList.push(this.keywords);
        setCookies('searchHistoryList',JSON.stringify(this.searchHistoryList),7*24*3600)
      }
      this.isLoading = true;
      getFrontTopicListApi(params).then(res=>{
        this.isLoading = false;
        if(res.state){
          this.listData = isFlash?res.data.topic.data:[...this.listData,...res.data.topic.data];
          this.listTypesData = res.data.tag.data;
          this.listParams.page++;
          this.listParams.total_page = res.data.topic.total_page;
          this.isResult = true;
        }else{
          this.$toast(res.error || '请求错误!');
        }
      }).catch(error => {
        this.isLoading = false;
        console.log(error)
      })
    },
    toDetails(topic,type){
      if(mc.isClient()){
        if(type=='tag'){
          let url = `${location.origin}/#/topicdetails/${topic.id}/`;
           mc.pushLinkViewController(url,'话题详情')
        }else{
          let url = `${location.origin}/#/sharedetail/${topic.topic_id}/`;
          mc.pushLinkViewController(url,'帖子详情')
        }
      }else{
        type=='tag'?this.$router.push({name:'TopicDetails',params:{id:topic.id}}):
            this.$router.push({name:'ShareDetail',params:{id:topic.topic_id}});
      }
    },
    onsearch(){
      this.listData = []
      this.listTypesData = []
      this.getList(true);
    },
    back(){
      if(mc.isClient()){
        mc.closeCurrentPage();
      }else{
        this.$router.go(-1);
      }
    },
    observedHandler(topic){
      if(this.isLoading) return;
      this.checkClinet(()=>{
        let params = {
          action:'subscribe',//unsubscribe
          to_id:topic.id
        }
        this.isLoading = true;
        postFrontTagApi(params).then(res=>{
          this.isLoading = false;
          if(res.state){
            this.$toast('操作成功');
          }else{
            this.$toast(res.error || '操作失败');
          }
        }).catch(error => {
          this.isLoading = false;
          console.log(error)
        })
      })
    },
    viewAllTags(){
      if(mc.isClient()){
        let url = `${location.origin}/#/pure-topiclist?word=${this.keywords}`
        mc.pushLinkViewController(url,'相关搜索')
      }else{
        this.$router.push({name:'PureTopicList',query:{word:this.keywords}})
      }
    },
    historyClick(history){
      this.keywords = history;
      this.getList(true);
    },
    highlighter(val){
      let regExp = new RegExp(this.keywords,'ig');
      return val.replace(regExp,`<em style="color:#E84048;">${this.keywords}</em>`);
    }
  }
}
</script>
<style lang="less" scoped>
.topic-search{
  padding-top:0.56rem;
  height: 100vh;
  background:#ffffff;
  .search-wrapper{
    padding:0 0.16rem;
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:0.56rem;
    display: flex;
    justify-content: space-between;
    align-items:center;
    background:#ffffff;
    z-index:99;
    .van-icon-arrow-left{
      width:0.2rem;
      height:0.24rem;
      line-height: 0.24rem;
      font-size:0.22rem;
    }
    .el-input{
      width:2.7rem;
      height:0.32rem;
      /deep/ .el-input__inner{
        width:100%;
        height:100%;
        outline: none!important;
        border:0!important;
        background: #F2F2F2;
        line-height: 0.32rem!important;
      }
      /deep/ .el-input__icon{
        line-height: 0.32rem;
      }
    }
    .cancel{
      width:0.36rem;
      height:0.32rem;
      line-height: 0.32rem;
      text-align: center;
      font-size:0.15rem;
      color:#222222;
    }
  }
  .topic-search-history{
    padding:0 0.16rem;
    .topic-search-history-label{
      padding-left:0.24rem;
      height:0.21rem;
      line-height: 0.21rem;
      color:#222222;
      font-size:0.15rem;
      font-weight:500;
      background:url("../assets/images/icon_history.png") no-repeat left center/0.15rem;
    }
    ul{
      margin-top: 0.1rem;
      display:flex;
      flex-wrap: wrap;
      li{
        margin:0 0 0.1rem 0.1rem;
        padding:0 0.09rem;
        height: 0.28rem;
        line-height: 0.28rem;
        border:0.01rem solid #e3e3e3;
        border-radius:0.06rem;
        font-size:0.12rem;
        font-weight:400;
      }
    }
  }
  .topic-list-wrapper{
    padding:0 0.16rem;
    width:100%;
    height:calc(100vh - 0.7rem);
    overflow-x: hidden;
    overflow-y: auto;
    .topic-types{
      height:0.9rem;
      display: flex;
      justify-content: space-between;
      align-items:center;
      &:not(:last-child){
        border-bottom:0.01rem solid #EBEBEB;
      }
      &.noBotLine{
        border-bottom:0;
      }
      .avatar-panel{
        min-width:0.5rem;
        width:0.5rem;
        height:0.5rem;
        border-radius:0.05rem;
        overflow: hidden;
      }
      .info-panel{
        flex:1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        margin-left: 0.12rem;
        height:0.52rem;
        .topic-name{
          width:2rem;
          line-height: 0.24rem;
          height:0.24rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color:#222222;
          font-size:0.16rem;
        }
        .record{
          display: flex;
          align-items: center;
          height:0.18rem;
          font-size:0.1rem;
          font-weight: 400;
          color: #999999;
          span{
            &:last-child{
              margin-left: 0.2rem;
            }
          }
        }
      }
      .observer-panel{
        min-width:0.65rem;
        width:0.65rem;
        height:0.27rem;
        background:url('../assets/images/icon_observer.png') no-repeat center/100%;
        &.observed{
          background:url('../assets/images/icon_observed.png') no-repeat center/100%;
        }
      }
    }
    .more-types{
      margin-top: 0.1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      i{
        width:1.2rem;
        height:0.01rem;
        background:#D8D8D8;
      }
      span{
        width:0.84rem;
        height:0.25rem;
        line-height: 0.25rem;
        text-align: center;
        border-radius: 0.13rem;
        border: 0.01rem solid #E84048;
        color:#E84048;
      }
    }
    .topic-items{
      padding:0.2rem 0 0.12rem;
      border-bottom: 0.01rem solid #EBEBEB;
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
        max-height: 0.48rem;
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
  &.is-android-style{
    padding-top: 0.86rem;
    .search-wrapper{
      top:0.3rem;
    }
    .topic-list-wrapper{
      height: calc(100vh - 1rem);
    }
  }
}
</style>