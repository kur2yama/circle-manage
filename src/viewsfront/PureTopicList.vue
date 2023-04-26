<template>
  <div class="pure-topic-list" :class="{'is-android-style':isAndroidStyle()}">
    <Header />
    <div class="topic-list-wrapper" v-infinite-scroll="getList">
      <li v-for="(topic,i) in listData" @click="toDetails(topic)">
        <div class="avatar-panel">
          <van-image
              width="0.50rem"
              height="0.50rem"
              fit="cover"
              :src="topic.image"
          />
        </div>
        <div class="info-panel">
          <div class="topic-name">#{{topic.tag}}#</div>
          <div class="record">
            <span>{{topic.onlooker}}人围观</span>
            <span>{{topic.num}}人动态</span>
          </div>
        </div>
        <div class="observer-panel" @click.stop="observedHandler(topic)"></div>
      </li>
      <div class="empty" v-if="listData && listData.length == 0"></div>
    </div>

  </div>
</template>

<script>
import { getFrontTagApi , postFrontTagApi } from '../api/post';
import clientConfig from '../utils/clientConfig'
import commonJs from '../utils/common'
import Header from '../components/header/Header'
export default {
  name: 'TopicSearch',
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
      }
    }
  },
  mounted(){
    this.$store.dispatch('changePageOn','puretopiclist');
  },
  methods:{
    getList(isFlash = false){
      if(this.isLoading) return;
      if((this.listParams.page > this.listParams.total_page)&&!isFlash) return;
      if(isFlash){ this.listParams.page = 1 };
      let params = {
        page:this.listParams.page,
        pagesize:20,
        state:this.type,
        action:'list',
        tag_name:this.$route.query.word
      }
      this.isLoading = true;
      getFrontTagApi(params).then(res=>{
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
    checkClinet(callback){
      if(mc.isClient()){
        mc.userGetInfo((res)=>{
          if(res.state=='1'){
            mc.userGetEncryptInfo((rep)=>{
              this.userInfo = rep.data;
              this.$store.dispatch('saveUserInfo',rep.data);
              if(callback) callback();
            })
          }else{
            mc.userLogin(()=>{
              mc.userGetEncryptInfo((resp)=>{
                this.userInfo = resp.data;
                this.$store.dispatch('saveUserInfo',resp.data);
                if(callback) callback();
              })
            });
          }
        })
      }else{
        this.$dialog.alert({
          message: '请于云上系列客户端打开链接',
          theme: 'round-button',
        }).then(() => {
          // let params = '{"contentid":"","appid":12,"siteid":"10125","url":"https://m-xiangyang.cjyun.org//huodong/usercenter-group/#/","type":1}'
          // let url = 'xiangyang://newsdetail?params=' + encodeURIComponent(params)
          // this.openApp(url,this.goConfirmAddr)
        });
      }
    },
    toDetails(topic){
      if(mc.isClient()){
        let url = `${location.origin}/#/topicdetails/${topic.id}`;
        mc.pushLinkViewController(url,'话题详情')
      }else{
        this.$router.push({name:'TopicDetails',params:{id:topic.id}});
      }

    }
  }
}
</script>
<style lang="less" scoped>
.pure-topic-list{
  padding-top:0.48rem;
  height: 100vh;
  background:#ffffff;
  .topic-list-wrapper{
    padding:0 0.16rem;
    width:100%;
    height:calc(100vh - 0.48rem);
    overflow-x: hidden;
    overflow-y: auto;
    li{
      height:0.9rem;
      display: flex;
      justify-content: space-between;
      align-items:center;
      &:not(:last-child){
        border-bottom:0.01rem solid #EBEBEB;
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
  }
  .empty{
    margin:0.5rem auto;
    width:2.4rem;
    height:1.2rem;
    background:url('../assets/images/empty1.png') center/100% no-repeat;
  }
  &.is-android-style{
    padding-top:0.72rem;
    .topic-nav-list-wrapper{
      top:0.3rem;
    }
    .topic-list-wrapper{
      height:calc(100vh - 0.72rem);
    }
  }
}
</style>