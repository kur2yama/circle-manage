import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    state:{
        isLoading:false,
        headerTitle:'',
        appUserInfo:{},
        pageon:'home',
        isAndroid:true
    },
    mutations:{
        CHANGE_TITLE(state,txt){
            state.headerTitle = txt;
        },
        CHANGE_PAGE_ON(state,txt){
            state.pageon = txt;
        },
        SAVE_USER_INFO(state,data){
            state.appUserInfo = data;
        }
    },
    actions:{
        changeTitle(context,txt) {
            context.commit('CHANGE_TITLE',txt)
        },
        changePageOn(context,txt) {
            context.commit('CHANGE_PAGE_ON',txt)
        },
        saveUserInfo(context,data){
            context.commit('SAVE_USER_INFO',data)
        }
    }
})

export default store