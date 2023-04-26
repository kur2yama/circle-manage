import Vue from 'vue'
import App from './App.vue'
import less from 'less'
import Vant from 'vant'
import { Lazyload ,Toast,Dialog,Swipe, SwipeItem} from 'vant';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
// import iView from 'iview';
// import 'iview/dist/styles/iview.css';

import "./assets/css/vant.less"
// import "./assets/css/font.css"

let isAndroid, isIOS, isIOS9, version,
    u = navigator.userAgent,
    ua = u.toLowerCase();

if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {   //android终端或者uc浏览器
  //Android系统
  isAndroid = true
}
Vue.prototype.$safeTop = isAndroid?'0.3rem':'0rem';


import '../src/utils/reset.css'
import '../src/utils/rem.js'
import '../src/utils/jssdk.js'
import '../src/utils/Oauth.js'
import "../src/utils/mc.js"
import 'vant/lib/index.css'
import router from './router'
import store from './store'

import Loading from './components/loading'
Vue.use(Loading)
Vue.use(less)
Vue.use(Vant)
Vue.use(ElementUI);

Vue.use(Lazyload);
Vue.use(Dialog);

Vue.config.productionTip = false
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
