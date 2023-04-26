import axios from 'axios'
import store from '../store'

export default function request(config) {
  //1，创建实例
  // axios.defaults.withCredentials = true;
  const instance = axios.create({
    baseURL: '/',
    timeout: 5000
  });
  //2，设置axios拦截器
  //2.1 请求时的拦截器
  instance.interceptors.request.use(config => {
    store.state.isLoading = true;
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    //展示进度条
    // Nprogress.start()
    //打包前打开 ↓↓↓↓↓
    // config.url = config.url.split(/\/api\//)[1];
    // if(store.state.appUserInfo.userid){
    //   config.params = {
    //     memberid:store.state.appUserInfo.userid,
    //     timestamp:store.state.appUserInfo.timestamp,
    //     sign:store.state.appUserInfo.signature,
    //     nonce:store.state.appUserInfo.nonce,
    //     ...config.params
    //   }
    // }
    config.params = {
      memberid:'369',
      timestamp:'123',
      sign:'3fa86cfeb3b8194de04ee43c244cc83d',
      nonce:'test',
      ...config.params
    }
    return config;
  }, error => {
    store.state.isLoading = false;
    console.log('请求失败', error);
    return error
  });
  //2.2 响应时的拦截
  instance.interceptors.response.use(res => {
    store.state.isLoading = false;
    //隐藏进度条
    // Nprogress.done()
    return res.data
  }, error => {
    store.state.isLoading = false;
    console.log('响应失败');
    return error
  });
  //3，发送真正的请求
  return instance(config)
}


