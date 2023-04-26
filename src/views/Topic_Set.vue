<template>
  <div class="topic-set" :class="{'is-android-style':isAndroidStyle()}">
    <Header />
    <div class="form-wrap">
      <div class="form-item">
        <div class="title">名称</div>
        <el-input v-model="edit.tag" placeholder="话题名称"></el-input>
      </div>
      <div class="form-item">
        <div class="title">分类</div>
        <el-input
            placeholder="请选择分类"
            suffix-icon="el-icon-arrow-down"
            v-model="edit.typename"
            :readonly="true"
            @focus="showCateSelect()"
        >
        </el-input>
      </div>
      <div class="form-item">
        <div class="title">简介</div>
        <el-input
            type="textarea"
            :rows="4"
            placeholder="话题简介"
            maxlength="300"
            show-word-limit
            v-model="edit.intro">
        </el-input>
      </div>
      <div class="form-item">
        <div class="title">上传背景图</div>
        <el-upload
            accept=".jpg,.jpeg,.png,.gif"
            class="avatar-uploader"
            action="string"
            :show-file-list="false"
            :http-request="handleImageUpload"
            :before-upload="beforeImageUpload">
          <img v-if="edit.image" :src="edit.image" class="thumb"></img>
          <i v-else class="el-icon-camera-solid avatar-uploader-icon"></i>
        </el-upload>
      </div>
    </div>

    <div class="submit-btn" @click="submit()">{{edit_id?'保存':'创建'}}</div>

    <!--选择分类弹框-->
    <van-action-sheet v-model="isCateSelect">
      <van-picker
          title="选择分类"
          show-toolbar
          :columns="options"
          @confirm="onConfirmSelect"
          @cancel="isCateSelect = false"
      />
    </van-action-sheet>
  </div>
</template>

<script>
import { getTagApi , postTagApi } from '../api/post';
import clientConfig from '../utils/clientConfig'
import commonJs from '../utils/common'
import Header from '../components/header/Header'
export default {
  name: 'TopicSet',
  mixins:[clientConfig,commonJs],
  components: {
    Header
  },
  data(){
    return{
      isLoading:false,
      edit_id:'',
      edit:{
        tag:'',
        typeid:'',
        typename:'',
        intro:'',
        image:''
      },
      isCateSelect:false,
      options:[]
    }
  },
  mounted(){
    this.$store.dispatch('changePageOn','topicset');
    this.getGroupList();
    if(this.$route.query.id){
      this.edit_id = this.$route.query.id;
    }
  },
  methods:{
    getGroupList(){
      this.options = [];
      let params = {
        action:'typelist'
      }
      getTagApi(params).then(res=>{
        if(res.state){
          res.data.list.map(item=>{
            let op = {
              value:item.id,
              text:item.name
            }
            this.options.push(op);
          })
          if(this.edit_id) this.getInfo();
        }
      }).catch(error => {
        console.log(error)
      })
    },
    getInfo(){
      let params ={
        action:'detail',
        tag_id:this.edit_id
      }
      getTagApi(params).then(res=>{
        if(res.state){
          this.edit.tag = res.data.detail.tag;
          this.edit.typeid = res.data.detail.typeid;
          this.edit.intro = res.data.detail.intro;
          this.edit.image = res.data.detail.image;
          this.edit.typename = this.options.find(i=>{
            return i.value == this.edit.typeid
          })['text'];
        }
      }).catch(err=>{
        console.log(err)
      })
    },
    handleImageUpload(file) {
      var _this = this;
      let fd = new FormData();
      fd.append('file', file.file);
      fd.append('filesize', file.file.size);
      fd.append('originName', file.file.name);
      fd.append('name', file.file.name);
      $.ajax({
        type:"post",
        url:"/index/upload/file?type=attachment&file=upload",
        data:fd,
        contentType:false,
        processData:false,
        success:function(res){
          if(res.state){
            _this.edit.image;
          }else{
            _this.$toast(res.error || '请求失败');
          }
        },
        error:function(err){

        }
      })
    },
    beforeImageUpload(file) {
      console.log(file)
      if(file.size>10240000){
        _this.$toast('图片大小不能超过10M');
        return false;
      }
    },
    showCateSelect(){
      this.isCateSelect = true;
    },
    onConfirmSelect(select){
      this.edit.typeid = select.value;
      this.edit.typename = select.text;
      this.isCateSelect = false;
    },
    submit(){
      let errList =[];
      if(!this.edit.tag) errList.push('话题名称');
      if(!this.edit.typeid) errList.push('分类');
      if(!this.edit.intro) errList.push('话题简介');
      if(!this.edit.image) errList.push('背景图');
      if(errList.length>0){
        let errStr = errList.join(',');
        this.$toast(`${errStr}不能为空`);
        return;
      }
      if(this.isLoading) return;
      let params = {
        action:'add',
        typeid:this.edit.typeid,
        tag:this.edit.tag,
        intro:this.edit.intro,
        image:this.edit.image
      }
      if(this.edit_id){
        params.action = 'edit';
        params.tag_id = this.edit_id;
      }
      this.isLoading = true;
      postTagApi(params).then(res=>{
        if(res.state){
          this.$toast('操作成功');
          setTimeout(()=>{
            this.$router.push({name:'Topic'}).catch(err=>{
              console.log(err)
            })
          },1000)
        }else{
          this.$toast(res.error || '请求错误!');
          this.isLoading = false;
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        console.log(error)
      })
    }
  }
}
</script>
<style lang="less" scoped>
.topic-set{
  padding-top:0.48rem;
  width:100%;
  min-height:100vh;
  background:#ffffff;
  color:#222222;
  font-size:0.16rem;
  .form-wrap{
    padding:0 0.16rem;
    .form-item{
      margin-top: 0.1rem;
      .title{
        line-height: 0.42rem;
        font-weight: 500;
      }
      .avatar-uploader{
        margin-top: 0.05rem;
        width:1rem;
        height:1rem;
        background: #F2F2F2;
        border-radius: 0.06rem;
        border: 0.01rem solid #F2F2F2;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        /deep/ .el-icon-camera-solid{
          color:#999999;
          font-size:0.3rem;
        }
        .thumb{
          width:1rem;
          height:1rem;
          object-fit: cover;
        }
      }
    }
  }
  .submit-btn{
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
    padding-top:0.78rem;
  }
}
</style>