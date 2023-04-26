<template>
  <div class="comment" :class="{'is-android-style':isAndroidStyle()}">
    <Header @backHandler="backList" />
    <div class="operate-wrapper">
      <van-search v-model="keyword" placeholder="搜索" @blur="getList(true)" @search="getList(true)" @clear="getList(true)" clearable  />
      <ul class="switch-wrapper">
        <li :class="{'active':type == 1}" @click="switchType(1)">待审核</li>
        <li :class="{'active':type == 2}" @click="switchType(2)">已通过</li>
        <li :class="{'active':type == 3}" @click="switchType(3)">已驳回</li>
        <li :class="{'active':type == 0}" @click="switchType(4)">全部</li>
      </ul>
    </div>
    <div class="list-wrapper" v-infinite-scroll="getList">
      <div class="list-item" v-for="(comment,i) in listData" @click="viewDetail(comment)">
        <div class="user-info">
          <div class="avatar">
            <div class="avatar-info">
              <van-image
                  fit="cover"
                  :src="comment.img_url"
                  loading-icon="contact"
                  error-icon="contact"
              />
              <div class="user-name">{{comment.member_name}}</div>
            </div>
            <div class="timed">{{comment.create_time}}</div>
          </div>
          <div class="btns">
            <span class="reject" v-if="comment.is_audit=='-2' || comment.is_audit=='-3' || comment.is_audit=='0'" @click.stop="operateHandler('fail',comment)">不通过</span>
            <span class="pass" v-if="comment.is_audit=='-2' || comment.is_audit=='-3' || comment.is_audit=='0'" @click.stop="operateHandler('pass',comment)">通过</span>
            <span class="pass" v-if="comment.is_audit=='1'" @click.stop="operateHandler('offline',comment)">下线</span>
            <span class="reject" v-if="comment.is_audit=='1' || comment.is_audit=='-4'" @click.stop="operateHandler('del',comment)">删除</span>
            <span class="pass" v-if="comment.is_audit=='-4'" @click.stop="operateHandler('restore',comment)">重审</span>
          </div>
        </div>
        <div class="work-name">{{comment.content}}</div>
        <div class="work-content">@{{comment.topic_data.content}}</div>
      </div>
    </div>
    <div class="empty" v-if="listData && listData.length == 0"></div>




    <!--详情展示框-->
    <CommentDetail ref="commentDetail" :show="isCommentDetail" @back="backAndFlash()"></CommentDetail>



  </div>
</template>

<script>
import { getCommentApi ,postCommentApi} from '../api/post';
import clientConfig from '../utils/clientConfig'
import commonJs from '../utils/common'
import Header from '../components/header/Header'
import CommentDetail from '../components/CommentDetail'
export default {
  name: 'Comment',
  mixins:[clientConfig,commonJs],
  components: {
    Header,
    CommentDetail
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
        total_page:0
      },
      isCommentDetail:false
    }
  },
  mounted(){
    this.getList(true);
    this.$store.dispatch('changePageOn','comment')
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
        action:'pending'
      }
      this.isLoading = true;
      getCommentApi(params).then(res=>{
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
    operateHandler(action,comment){
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
          data:comment.id
        }
        this.isLoading = true;
        postCommentApi(params).then(res=>{
          this.isLoading = false;
          if(res.state){
            this.getList(true);
            this.$toast('操作成功');
          }else{
            this.$toast(res.error || '操作失败');
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
    viewDetail(comment){
      // ImagePreview({images:['https://img01.yzcdn.cn/vant/apple-1.jpg'],closeable: true});
      this.isCommentDetail = true;
      this.$store.dispatch('changePageOn','commentDetail');
      this.$refs.commentDetail.init(comment.content_id,comment.id);
    },
    backList(){
      this.isCommentDetail = false;
      this.$store.dispatch('changePageOn','comment');
    },
    backAndFlash(){
      this.isCommentDetail = false;
      this.$store.dispatch('changePageOn','comment');
      this.getList(true);
    }
  }
}
</script>
<style lang="less" scoped>
.comment{
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
      padding:0.08rem 0;
      width:100%;
      height:1.33rem;
      background:#ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      &:not(:last-child){
        border-bottom:0.01rem solid #D8D8D8;
      }
      .work-name{
        height:0.3rem;
        line-height: 0.3rem;
        color:#222222;
        font-size:0.15rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .work-content{
        height:0.3rem;
        line-height: 0.3rem;
        color:#222222;
        font-size:0.14rem;
        font-weight:400;
        color:#999999;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .user-info{
        height:0.48rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .avatar{
          height:0.48rem;
          display: flex;
          justify-content: space-between;
          flex-direction: column;
          font-size: 0.14rem;
          .avatar-info{
            height:0.3rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .user-name{
              margin-left: 0.12rem;
              width:1.5rem;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .van-image{
              width:0.24rem;
              height:0.24rem;
              border-radius:50%;
              overflow: hidden;
              /deep/ .van-icon-contact {
                font-size:0.18rem;
              }
            }
          }
          .timed{
            height:0.18rem;
            font-size: 0.11rem;
            color:#999999;
          }
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
              width:0.6rem;
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
  &.is-android-style{
    .operate-wrapper{
      top:0.78rem;
    }
    .list-wrapper{
      padding-top:1.6rem;
    }
    .comment-detail{
      top:0.78rem;
    }
  }
}
</style>