import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Comment from '../views/Comment.vue'
import Article from '../views/Article.vue'
import Topic from '../views/Topic.vue'
import Topic_Set from '../views/Topic_Set.vue'
import Topic_View from '../views/Topic_View.vue'
import ShareDetail from '../viewsfront/ShareDetail.vue'
import TopicList from '../viewsfront/TopicList.vue'
import TopicDetails from '../viewsfront/TopicDetails.vue'
import TopicSearch from '../viewsfront/TopicSearch.vue'
import PureTopicList from '../viewsfront/PureTopicList.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: "*",
    redirect: "/",
    name: 'Home'
  },
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/article',
    name: 'Article',
    component: Article
  },
  {
    path: '/comment',
    name: 'Comment',
    component: Comment
  },
  {
    path: '/topic',
    name: 'Topic',
    component: Topic
  },
  {
    path: '/topic_set',
    name: 'Topic_Set',
    component: Topic_Set
  },
  {
    path: '/topic_view',
    name: 'Topic_View',
    component: Topic_View
  },
  {
    path: '/sharedetail/:id',
    name: 'ShareDetail',
    component: ShareDetail
  },
  {
    path: '/topiclist/',
    name: 'TopicList',
    component: TopicList
  },
  {
    path: '/topicdetails/:id',
    name: 'TopicDetails',
    component: TopicDetails
  },
  {
    path: '/topic-search',
    name: 'TopicSearch',
    component: TopicSearch
  },
  {
    path: '/pure-topiclist',
    name: 'PureTopicList',
    component: PureTopicList
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

// router.beforeEach((to, from, next) => {
//   if(!mc.isClient()){
//     if(to.name == "Home"){
//       next()
//     }else{
//       console.log("asdasd")
//       next({
//         path: '/'
//       })
//     }
//   }else{
//     next()
//   }
// })

export default router
