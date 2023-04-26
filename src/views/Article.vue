<template>
  <div class="article" :class="{'is-android-style':isAndroidStyle()}">
    <Header @backHandler="backList" :headInfo="headInfo"/>
    <div class="operate-wrapper">
      <van-search v-model="keyword" placeholder="搜索" @blur="getList(true)" @search="getList(true)" @clear="getList(true)" clearable  />
      <ul class="switch-wrapper">
        <li :class="{'active':type == 1}" @click="switchType(1)">待审核</li>
        <li :class="{'active':type == 2}" @click="switchType(2)">已通过</li>
        <li :class="{'active':type == 3}" @click="switchType(3)">已驳回</li>
        <li :class="{'active':type == 4}" @click="switchType(4)">全部</li>
      </ul>
    </div>
    <div class="list-wrapper" v-infinite-scroll="getList">
      <div class="list-item" v-for="(article,i) in listData" @click="viewDetail(article)">
        <div class="avatar">
          <van-image
              width="0.54rem"
              height="0.54rem"
              fit="cover"
              :src="article.thumb"
              loading-icon="contact"
              error-icon="contact"
          />
        </div>
        <div class="content">
          <div class="top">
            <div class="name">{{article.nickname}}</div>
            <div class="btns">
              <span class="reject" v-if="article.state=='0'" @click.stop="operateHandler('fail',article)">驳回</span>
              <span class="pass" v-if="article.state=='0'" @click.stop="operateHandler('pass',article)">通过</span>
              <span class="reject" v-if="article.state=='1'" @click.stop="operateHandler('offline',article)">下线</span>
              <span class="pass" v-if="article.state=='1'">置顶</span>
              <span class="repass" v-if="article.state=='2'" @click.stop="operateHandler('restore',article)">重审</span>
              <span class="delete" v-if="article.state=='2'" @click.stop="operateHandler('del',article)">删除</span>
            </div>
          </div>
          <div class="bot" v-html="article.content"></div>
        </div>
      </div>
    </div>
    <div class="empty" v-if="listData && listData.length == 0"></div>



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


    <!--详情展示框-->
    <ArticleDetail ref="articleDetail" :show="isArticleDetail" @back="backAndFlash()"></ArticleDetail>



  </div>
</template>

<script>
import { getCircleApi,postCircleApi } from '../api/post';
import clientConfig from '../utils/clientConfig'
import commonJs from '../utils/common'
import Header from '../components/header/Header'
import ArticleDetail from '../components/ArticleDetail'

export default {
  name: 'Article',
  mixins:[clientConfig,commonJs],
  components: {
    Header,
    ArticleDetail
  },
  data(){
    return{
      keyword:'',
      isLoading:false,
      type:1,
      listData:[],
      listParams:{
        page:1,
        pagesize:10,
        total:0,
        total_page:1
      },
      isArticleDetail:false,
      headInfo:{},
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
    this.$store.dispatch('changePageOn','article')
    this.getList(true);
  },
  methods:{
    getList(isFlash = false){
      if(this.isLoading) return;
      if((this.listParams.page > this.listParams.total_page)&&!isFlash) return;
      if(isFlash){ this.listParams.page = 1 };
      let params = {
        page:this.listParams.page,
        pagesize:10,
        state:this.type,
        action:'list'
      }
      this.isLoading = true;
      getCircleApi(params).then(res=>{
        this.isLoading = false;
        if(res.state){
          this.listData = isFlash?res.data.data:[...this.listData,...res.data.data];
          this.listParams.page++;
          this.listParams.total_page = res.data.total_page
        }else{
          this.$toast(res.error || '请求错误!');
        }
      }).catch(error => {
        this.isLoading = false;
        console.log(error)
      })
    },
    switchType(type){
      this.type = type;
      this.listData = [];
      this.getList(true);
    },
    operateHandler(action,article){
      if(this.isLoading) return;
      let tips,message;
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
          action: action=='offline'?'restore':action,
          topic_id: article.topic_id
        }
        this.isLoading = true;
        postCircleApi(params).then(res=>{
          this.isLoading = false;
          if(res.state){
            this.getList(true);
            this.$toast('操作成功');
          }else{
            this.$toast(res.error);
            this.getList(true);
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
    },
    viewDetail(article){
      this.isArticleDetail = true;
      this.$store.dispatch('changePageOn','articleDetail');
      this.$refs.articleDetail.init(article.topic_id);
      this.headInfo = {
        avatar:article.thmub,
        name:article.nickname
      };
    },
    backList(){
      this.isArticleDetail = false;
      this.$store.dispatch('changePageOn','article');
    },
    backAndFlash(){
      this.isArticleDetail = false;
      this.$store.dispatch('changePageOn','article');
      this.getList(true);
    }
  }
}
</script>
<style lang="less" scoped>
.article{
  width:100%;
  min-height:100vh;
  background:#ffffff;
  color:#222222;
  font-size:0.16rem;
  &.noScroll{
    max-height:10vh;
    overflow: hidden;
  }
  .operate-wrapper{
    position:fixed;
    top:0.48rem;
    left:0;
    width:100%;
    height: 0.82rem;
    background:#ffffff;
    z-index:99;
    .van-search{
      height:0.32rem;
    }
    /deep/ .van-search__content{
      border-radius: 0.04rem;
    }
    .switch-wrapper{
      margin-top: 0.05rem;
      padding:0 0.16rem;
      height:0.36rem;
      display:flex;
      align-items: center;
      justify-content: space-between;
      li{
        width:0.6rem;
        height:0.36rem;
        line-height: 0.36rem;
        text-align: center;
        color:#999999;
        font-weight:500;
        &.active{
          color:#222222;
          font-weight:550;
          position:relative;
          &::before{
            position:absolute;
            left:50%;
            bottom:0;
            transform: translateX(-50%);
            content:'';
            display: block;
            width:0.15rem;
            height:0.04rem;
            background: #1767F7 linear-gradient(133deg, #E84048 0%, #ef7d82 100%);
            border-radius: 0.02rem;
          }
        }
      }
    }
  }
  .list-wrapper{
    width:100%;
    padding:1.3rem 0.16rem 0;
    .list-item{
      width:100%;
      height:0.94rem;
      background:#ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      &:not(:last-child){
        border-bottom:0.01rem solid #D8D8D8;
      }
      .avatar{
        min-width:0.54rem;
        width:0.54rem;
        height:0.54rem;
        overflow: hidden;
        border-radius:50%;
      }
      .content{
        flex:1;
        padding-left:0.16rem;
        height:0.54rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .top{
          display: flex;
          justify-content: space-between;
          align-items: center;
          .name{
            width:1.2rem;
            height:0.26rem;
            line-height: 0.26rem;
            font-size: 0.15rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .btns{
            display: flex;
            span{
              margin-left:0.06rem;
              width:0.54rem;
              height:0.26rem;
              line-height: 0.26rem;
              border-radius: 0.06rem;
              text-align: center;
              font-size: 0.14rem;
              &.reject{
                background: rgba(253,150,36,0.2);
                color:#FD9624;
              }
              &.pass{
                background: rgba(0,139,238,0.2);
                color:#008BEE;
              }
              &.repass{
                background: rgba(0,139,238,0.2);
                color:#008BEE;
              }
              &.delete{
                background: rgba(253,36,36,0.2);
                color:#FF2C2C;
              }
            }
          }
        }
        .bot{
          width:2.64rem;
          height:0.2rem;
          line-height: 0.2rem;
          color:#999999;
          font-size:0.14rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }

  //详情弹框
  .article-content{
    height:calc(100vh - 0.48rem);
  }
  .empty{
    margin:0.5rem auto;
    width:2.4rem;
    height:1.2rem;
    background:url('../assets/images/empty1.png') center/100% no-repeat;
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

  &.is-android-style{
    .operate-wrapper{
      top:0.78rem;
    }
    .list-wrapper{
      padding-top:1.6rem;
    }
    .article-detail{
      top:0.78rem;
    }
  }
}
</style>