<template>
  <div class="topic" :class="{'is-android-style':isAndroidStyle()}">
    <Header/>
    <div class="operate-wrapper">
      <van-search v-model="tag_name" placeholder="搜索" @blur="getList(true)" @search="getList(true)" @clear="getList(true)" clearable  />
    </div>
    <div class="list-wrapper" v-infinite-scroll="getList">
      <div class="list-item" v-for="(tag,i) in listData" @click="viewDetail(tag)">
        <div class="avatar">
          <van-image
              width="0.54rem"
              height="0.54rem"
              fit="cover"
              :src="tag.image"
          />
        </div>
        <div class="content">
          <div class="top">
            <div class="name">#{{tag.tag}}#</div>
            <div class="btns">
              <span class="reject" @click.stop="offline(tag)">下线</span>
              <!--<span class="pass" @click.stop="upline()">上线</span>-->
            </div>
          </div>
          <div class="bot">
            {{tag.intro}}
          </div>
        </div>
      </div>
    </div>
    <div class="empty" v-if="listData && listData.length == 0"></div>
    <div class="add-wrap">
      <span @click="toAdd()"></span>
    </div>
  </div>
</template>

<script>
import { getTagApi , postTagApi} from '../api/post';
import clientConfig from '../utils/clientConfig'
import commonJs from '../utils/common'
import Header from '../components/header/Header'
export default {
  name: 'Topic',
  mixins:[clientConfig,commonJs],
  components: {
    Header
  },
  data(){
    return{
      isLoading:false,
      tag_name:'',
      listData:[],
      listParams:{
        page:1,
        pagesize:10,
        total_page:1
      }
    }
  },
  mounted(){
    this.$store.dispatch('changePageOn','topic');
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
        action:'list',
        tag_name:this.tag_name
      }
      this.isLoading = true;
      getTagApi(params).then(res=>{
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
    toAdd(){
      this.$router.push({name:'Topic_Set'}).catch(err=>{
        console.log(err)
      })
    },
    viewDetail(tag){
      this.$router.push({name:"Topic_View",query:{id:tag.id}}).catch(err=>{
        console.log(err)
      })
    },
    offline(tag){
      if(this.isLoading) return;

      this.$dialog.confirm({
        title: '确认下线',
        message: '是否确认下线话题',
      }).then(() => {
        let params = {
          action: 'offline',
          tag_id: tag.id
        }
        this.isLoading = true;
        postTagApi(params).then(res=>{
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
    }
  }
}
</script>
<style lang="less" scoped>
.topic{
  width:100%;
  min-height:100vh;
  background:#ffffff;
  color:#222222;
  font-size:0.16rem;
  overflow: hidden;
  &.noScroll{
    max-height:100vh;
    overflow: hidden;
  }
  .operate-wrapper{
    position:fixed;
    top:0.48rem;
    left:0;
    width:100%;
    height: 0.32rem;
    background:#ffffff;
    z-index:99;
    .van-search{
      height:0.32rem;
    }
    /deep/ .van-search__content{
      border-radius: 0.04rem;
    }
  }
  .list-wrapper{
    width:100%;
    padding:0.8rem 0.16rem 1rem;
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
        border-radius:0.08rem;
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
            width:1.6rem;
            height:0.26rem;
            line-height: 0.26rem;
            font-size: 0.15rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-weight: 500;
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
              &.reject{
                background: rgba(253,150,36,0.2);
                color:#FD9624;
              }
              &.pass{
                background: rgba(0,139,238,0.2);
                color:#008BEE;
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
  .empty{
    margin:0.5rem auto;
    width:2.4rem;
    height:1.2rem;
    background:url('../assets/images/empty1.png') center/100% no-repeat;
  }
  .add-wrap{
    width:100%;
    height:1rem;
    background:#ffffff;
    position: fixed;
    bottom:0rem;
    left:0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index:10;
    span{
      width:0.5rem;
      height:0.5rem;
      background:url("../assets/images/icon_add.png") no-repeat center/100%;
    }
  }
  &.is-android-style{
    .operate-wrapper{
      top:0.78rem;
    }
    .list-wrapper{
      padding-top:1.1rem;
    }
  }
}
</style>