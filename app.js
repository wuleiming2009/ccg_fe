const ccgapi = require('./api/ccgapi');

App({
  onLaunch() {
    console.log('小程序启动')
    wx.login({
      async success(res) {
        const code = res.code
        if (!code) {
          console.error('未获取到js_code')
          return
        }
        try {
          const loginResp = await ccgapi.login({ js_code: code })
          wx.setStorageSync('token', loginResp.access_token)
        } catch (e) {
          console.error('登录失败', e)
        }
      },
      fail(err) {
        console.error('wx.login失败', err)
      }
    })
  },
  onShow() {
    console.log('小程序显示')
  },
  onHide() {
    console.log('小程序隐藏')
  }
})
