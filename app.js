const mtjwxsdk = require('./utils/mtj-wx-sdk.js');
const ccgapi = require('./api/ccgapi');
const { createClient } = require('./openai/wx-openai/index');
const { config: aiConfig } = require('./openai/wx-openai/config');
const env = require('./config/env');

App({
  globalData: {
    aiClient: null,
    userConfig: null,
    loginPromise: null
  },
  onLaunch() {
    console.log('小程序启动')
    try {
      const storedSwitch = wx.getStorageSync('guideTest')
      const guideTest = typeof storedSwitch === 'boolean' ? storedSwitch : !!(env && env.guideTest)
      wx.setStorageSync('guideTest', !!guideTest)
      try { wx.removeStorageSync('guideChecked') } catch (_) {}
      const envGuide = !!(env && env.guideTest)
      const rawDone = wx.getStorageSync('guideDone')
      const guideDone = (rawDone === true) || (rawDone === 'true') || (rawDone === 1) || (rawDone === '1')
      console.log('GuideStatus/startup', {
        envGuideTest: envGuide,
        rawGuideDone: rawDone,
        resolvedGuideDone: guideDone
      })
    } catch (_) {}
    try { this.globalData.aiClient = createClient({ provider: 'deepseek', ...aiConfig.deepseek }) } catch (e) { console.warn('AI 客户端初始化失败', e) }
    this._initLoginPromise()
  },
  _initLoginPromise() {
    this.globalData.loginPromise = new Promise((resolve, reject) => {
      wx.login({
        async success(res) {
          const code = res.code
          if (!code) {
            console.error('未获取到js_code')
            reject(new Error('未获取到js_code'))
            return
          }
          try {
            const loginResp = await ccgapi.login({ js_code: code })
            wx.setStorageSync('token', loginResp.access_token)
            const initResp = await ccgapi.userInit({})
            const userConfig = {
              questions: Array.isArray(initResp.questions) ? initResp.questions : [],
              model: initResp.model || '',
              user_name: initResp.user_name || '',
              phone: initResp.phone || initResp.wx_phone || '',
              prompt: initResp.prompt || '',
              home_entries: initResp.home_entries || []
            }
            wx.setStorageSync('userConfig', userConfig)
            console.log("获取用户初始化配置:", wx.getStorageSync('userConfig'))
            try {
              const model = String(userConfig.model || '').toLowerCase()
              if (model === 'qwen') {
                getApp().globalData.aiClient = createClient({ provider: 'qwen', ...aiConfig.qwen })
              } else if (model === 'deepseek') {
                getApp().globalData.aiClient = createClient({ provider: 'deepseek', ...aiConfig.deepseek })
              } else if (model === 'doubao') {
                getApp().globalData.aiClient = createClient({ provider: 'doubao', ...aiConfig.doubao })
              }
            } catch (e) { console.warn('根据model切换AI失败', e) }
            resolve()
          } catch (e) {
            console.error('登录或初始化失败', e)
            reject(e)
          }
        },
        fail(err) {
          console.error('wx.login失败', err)
          reject(err)
        }
      })
    })
  },
  ensureLogin() {
    const token = wx.getStorageSync('token')
    if (token) return Promise.resolve()
    return this.globalData.loginPromise
  },
  onShow() {
    console.log('小程序显示')
  },
  onHide() {
    console.log('小程序隐藏')
  }
})
