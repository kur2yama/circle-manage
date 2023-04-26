import request from '../utils/api'
import qs from 'qs'
// 帖子审核数量
export function getCircleAuditApi(params) {
  return request({
    url: '/api/circle/audit',
    method: 'get',
    params
  })
}
// 帖子审核相关 共用一个接口
export function getCircleApi(params) {
  return request({
    url: '/api/circle/topic',
    method: 'get',
    params
  })
}
// 帖子审核相关 共用一个接口 post
export function postCircleApi(params) {
  return request({
    url: '/api/circle/topic',
    method: 'post',
    data:qs.stringify(params)
  })
}

// 评论审核相关 共用一个接口
export function getCommentApi(params) {
  return request({
    url: '/api/circle/reply',
    method: 'get',
    params
  })
}
// 评论审核相关 共用一个接口 post
export function postCommentApi(params) {
  return request({
    url: '/api/circle/reply',
    method: 'post',
    data:qs.stringify(params)
  })
}

// 话题管理相关 共用一个接口
export function getTagApi(params) {
  return request({
    url: '/api/circle/tag',
    method: 'get',
    params
  })
}
// 话题管理相关 共用一个接口 post
export function postTagApi(params) {
  return request({
    url: '/api/circle/tag',
    method: 'post',
    data:qs.stringify(params)
  })
}

// 前台话题相关 共用一个接口 get
export function getFrontTagApi(params) {
  return request({
    url: '/api/circle/tagapi',
    method: 'get',
    params
  })
}
// 前台话题相关 共用一个接口 post
export function postFrontTagApi(params) {
  return request({
    url: '/api/circle/tagapi',
    method: 'post',
    data:qs.stringify(params)
  })
}

// 话题下帖子列表接口 get
export function getFrontTopicListApi(params) {
  return request({
    url: '/api/circle/topicapi',
    method: 'get',
    params
  })
}
// 帖子详情
export function getFrontTopicDetailsApi(params) {
  return request({
    url: '/api/circle/topicapi',
    method: 'get',
    params
  })
}

// 帖子详情评论
export function getFrontTopicCommentApi(params) {
  return request({
    url: '/api/circle/replyapi',
    method: 'get',
    params
  })
}

// 通用杂项接口 关注博主/移除
export function postFrontCommonApi(params) {
  return request({
    url: '/api/circle/commonapi',
    method: 'post',
    data:qs.stringify(params)
  })
}

// 上传图片
// export function unloadImage(params){
//   return request({
//     url: '/api/index/upload/file?type=attachment&file=upload',
//     method: 'post',
//     contentType:false,
//     processData:false,
//     data:qs.stringify(params)
//   })
// }







// 订单详情POST
export function getOrderDetailApi(params) {
  return request({
    url: '/api/booking/orderDetail',
    method: 'post',
    data:qs.stringify(params)
  })
}

// 评分接口
export function postRateApi(params) {
  return request({
    url: '/api/superhand/projectscore',
    method: 'post',
    data:params,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    transformRequest: [
      function (data) {
        let ret = ''
        for (let it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        ret = ret.substring(0, ret.lastIndexOf('&'));
        return ret
      }
    ]
  })
}


// 获取微信配置信息
export function getwxconfigApi(params) {
  return request({
    url: '/api/ajax/wechatShare',
    method: 'get',
    params
  })
}