const ccgapi = require('./api/ccgapi');
const { createClient } = require('./openai/wx-openai/index');
const { config: aiConfig } = require('./openai/wx-openai/config');

App({
  globalData: {
    aiClient: null,
    userConfig: null
  },
  onLaunch() {
    console.log('小程序启动')
    try { this.globalData.aiClient = createClient({ provider: 'deepseek', ...aiConfig.deepseek }) } catch (e) { console.warn('AI 客户端初始化失败', e) }
    wx.login({
      async success(res) {
        const code = res.code
        if (!code) {
          console.error('未获取到js_code')
          return
        }
        try {
          // 用户登录
          const loginResp = await ccgapi.login({ js_code: code })
          wx.setStorageSync('token', loginResp.access_token)
          // 获取用户初始化配置
          const initResp = await ccgapi.userInit({})
          const userConfig = {
            questions: Array.isArray(initResp.questions) ? initResp.questions : [],
            model: initResp.model || '',
            user_name: initResp.user_name || '',
            phone: initResp.phone || initResp.wx_phone || ''
          }
          wx.setStorageSync('userConfig', userConfig)
          console.log("获取用户初始化配置:", wx.getStorageSync('userConfig'))
          // 根据 model 选择大模型
          try {
            const model = String(userConfig.model || '').toLowerCase()
            if (model === 'qwen') {
              getApp().globalData.aiClient = createClient({ provider: 'qwen', ...aiConfig.qwen })
            } else if (model === 'deepseek') {
              getApp().globalData.aiClient = createClient({ provider: 'deepseek', ...aiConfig.deepseek })
            }
          } catch (e) { console.warn('根据model切换AI失败', e) }
        } catch (e) {
          console.error('登录或初始化失败', e)
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
