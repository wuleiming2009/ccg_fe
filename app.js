const ccgapi = require('./api/ccgapi');
const { createClient } = require('./openai/wx-openai/index');
const { config: aiConfig } = require('./openai/wx-openai/config');

App({
  globalData: {
    aiClient: null
  },
  onLaunch() {
    console.log('小程序启动')
    try {
      this.globalData.aiClient = createClient({ provider: 'deepseek', ...aiConfig.deepseek })
    } catch (e) {
      console.warn('AI 客户端初始化失败', e)
    }
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
