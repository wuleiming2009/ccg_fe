// utils/request.js 小程序全局请求封装 (纯JS版，完美兼容所有页面)
const { mode, baseUrl } = require('../config/env');
console.log('[request] mode:', mode, 'baseUrl:', baseUrl);

/**
 * 全局统一请求方法
 * @param {String} url 接口路径（拼接在baseUrl后面，如：/getList）
 * @param {String} method 请求方式，默认GET (GET/POST/PUT/DELETE)
 * @param {Object} data 请求参数，默认空对象
 * @param {Object} header 自定义请求头，默认空
 */
function request(url, method = 'GET', data = {}, header = {}) {
  // 显示小程序原生加载弹窗，mask:true 防止点击穿透
  wx.showLoading({
    title: '加载中...',
    mask: true
  });

  // 返回Promise对象，方便页面用 async/await 调用，写法更优雅
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + url, // 拼接完整接口地址
      method: method,
      data: data,
      // 合并默认请求头 + 自定义请求头
      header: {
        'content-type': 'application/json', // 默认请求头
        'Authorization': wx.getStorageSync('token') || '', // 全局携带token（登录后存储的token）
        ...header // 自定义请求头会覆盖默认的
      },
      // 请求成功
      success(res) {
        // 这里可以统一处理后端返回的状态码
        const resData = res.data;
        // 举例：后端约定 code=200 为请求成功
        if (resData.code === 200) {
          resolve(resData.data); // 只返回业务数据，页面不用再解析res.data.data
        } else if (resData.code === 401) {
          // 特殊处理：token过期/未登录，统一跳转登录页
          wx.showToast({ title: '请先登录', icon: 'none' });
          wx.navigateTo({ url: '/pages/login/login' });
          reject(resData);
        } else {
          // 业务错误，比如参数错误、数据不存在等，显示后端返回的提示文字
          wx.showToast({ title: resData.msg || '请求失败', icon: 'none' });
          reject(resData);
        }
      },
      // 请求失败（网络错误、域名错误、超时等）
      fail(err) {
        wx.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
        reject(err);
      },
      // 请求完成（无论成败都会执行）
      complete() {
        wx.hideLoading(); // 关闭加载弹窗
      }
    });
  });
}

// 简化调用：封装GET/POST快捷方法，页面调用更方便
request.get = (url, data, header) => request(url, 'GET', data, header);
request.post = (url, data, header) => request(url, 'POST', data, header);

// 暴露方法，让其他页面可以导入使用
module.exports = request;
