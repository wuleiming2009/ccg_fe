Page({
  data: {
    greeting: '',
    welcomStr: '愿你被生活温柔以待',
    messages: [
      { role: 'assistant', content: '嗨！我是你的专属礼赠顾问。最近是有什么开心的事，还是遇到了什么送礼的难题？跟我说说，我来帮你参谋参谋～' }
    ],
    inputValue: '',
    scrollInto: '',
    showMyGifts: true,
    showGiftHistory: true,
    hasPills: true,
    voiceMode: false,
    recording: false,
    voiceHint: '按住说话'
  },
  onLoad(options) {
    const app = getApp()
    this.client = app && app.globalData && app.globalData.aiClient
    const ui = require('../../config/ui')
    const cfg = wx.getStorageSync('userConfig') || {}
    const showMyGifts = cfg.showMyGifts !== undefined ? !!cfg.showMyGifts : !!ui.showMyGifts
    const showGiftHistory = cfg.showGiftHistory !== undefined ? !!cfg.showGiftHistory : !!ui.showGiftHistory
    const hasPills = showMyGifts || showGiftHistory
    this.setData({ showMyGifts, showGiftHistory, hasPills })
    if (options && options.reset === '1') {
      this.setData({ messages: [ { role: 'assistant', content: '嗨！我是你的专属礼赠顾问。最近是有什么开心的事，还是遇到了什么送礼的难题？跟我说说，我来帮你参谋参谋～' } ], inputValue: '', scrollInto: 'end-anchor' })
    }
    const { questions, PERSONA_PROMPT } = require('../../config/chatbot')
    const qs = Array.isArray(cfg.questions) && cfg.questions.length ? cfg.questions : questions
    this.questions = qs
    this.qThreshold = Math.ceil((qs.length || 0) * 0.8)
    const qList = qs.map((q, i) => `${i + 1}. ${q}`).join('；')
    this.personaPrompt = `${PERSONA_PROMPT} 请以自然中文表达，不要输出括号或其他标记的语气/动作词，如（关切的）（轻声的）。逐步询问以下问题，至少覆盖80%，每次只问1-2个并结合上下文：${qList}。在获取足够信息后，给出预算匹配、创意与走心度兼顾的礼物建议。`
    this.setData({ scrollInto: 'end-anchor' })
    this.initVoice()
  },
  onShow() {
    this.setData({ greeting: this.getGreeting() })
    const ccgapi = require('../../api/ccgapi');
    ccgapi.welcomeString({}).then((resp) => {
      this.setData({ welcomStr: resp.str })
    })
  },
  initVoice() {
    try {
      const plugin = requirePlugin('WechatSI')
      this.recManager = plugin.getRecordRecognitionManager && plugin.getRecordRecognitionManager()
      this.recManager.onRecognize = (res) => {
        const t = res.result || ''
        this.setData({ inputValue: t })
      }
      this.recManager.onStop = (res) => {
        const t = res.result || ''
        const text = (t || '').trim()
        this.setData({ recording: false, voiceHint: '按住说话', inputValue: text })
        if (text) {
          this.onSend()
        } else {
          wx.showToast({ title: '未识别到语音', icon: 'none' })
        }
      }
      this.recManager.onError = () => {
        this.setData({ recording: false, voiceHint: '按住说话' })
        wx.showToast({ title: '语音识别失败', icon: 'none' })
      }
    } catch (e) {}
  },
  async ensureRecordAuth() {
    try {
      const setting = await new Promise(resolve => wx.getSetting({ success: resolve, fail: () => resolve({ authSetting: {} }) }))
      if (!setting.authSetting || !setting.authSetting['scope.record']) {
        await new Promise((resolve, reject) => wx.authorize({ scope: 'scope.record', success: resolve, fail: reject }))
      }
    } catch (e) {
      wx.showModal({ title: '需要录音权限', content: '请在设置中允许麦克风权限以使用语音输入', success: (r) => { if (r.confirm) wx.openSetting({}) } })
      throw e
    }
  },
  onToggleVoiceMode() {
    const next = !this.data.voiceMode
    this.setData({ voiceMode: next })
  },
  async onVoiceStart() {
    if (!this.recManager) { wx.showToast({ title: '语音未就绪', icon: 'none' }); return }
    await this.ensureRecordAuth().catch(() => {})
    this.setData({ recording: true, voiceHint: '松开结束' })
    this.recManager.start({ lang: 'zh_CN' })
  },
  onVoiceEnd() {
    if (!this.recManager) return
    this.setData({ voiceHint: '按住说话' })
    this.recManager.stop()
  },
  onVoiceCancel() {
    if (!this.recManager) return
    this.setData({ recording: false, voiceHint: '按住说话' })
    this.recManager.stop()
  },
  getGreeting() {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return '早上好 ✨'
    if (hour >= 12 && hour < 18) return '下午好 ✨'
    return '晚上好 ✨'
  },
  onMatch() {
    console.log('开启礼物匹配')
  },
  onMyGifts() {
    console.log('查看我的礼赠')
  },
  onGiftHistory() {
    wx.navigateTo({ url: '/pages/history/history' })
  },
  onInput(e) {
    this.setData({ inputValue: e.detail.value })
  },
  async onSend() {
    const text = (this.data.inputValue || '').trim()
    if (!text) return
    const msgs = this.data.messages.concat([{ role: 'user', content: text }])
    this.setData({ messages: msgs, inputValue: '', scrollInto: 'end-anchor' })
    const withTyping = this.data.messages.concat([{ role: 'assistant', content: '...', typing: true }])
    this.setData({ messages: withTyping, scrollInto: 'end-anchor' })
    try {
      if (!this.client) {
        wx.showToast({ title: 'AI未初始化', icon: 'none' })
        return
      }
      const resp = await this.client.chat({ messages: this.buildChatMessages(msgs) })
      const list = this.data.messages.slice()
      const typingIndex = list.length - 1
      list[typingIndex] = { role: 'assistant', content: this.sanitize(resp.content || '（无回复）') }
      this.setData({ messages: list, scrollInto: 'end-anchor' })
      this.updateCTAVisibility()
    } catch (e) {
      wx.showToast({ title: '发送失败', icon: 'none' })
      console.error('chat send error', e)
    }
  },
  buildChatMessages(list) {
    return [{ role: 'system', content: this.personaPrompt }].concat(list)
  },
  sanitize(text) {
    return String(text)
      .replace(/（[^）]{1,20}）/g, '')
      .replace(/\([^)]{1,20}\)/g, '')
      .trim()
  },
  updateCTAVisibility() {
    const hasCTA = (this.data.messages || []).some(m => m.type === 'cta')
    const userCount = (this.data.messages || []).filter(m => m.role === 'user').length
    if (!hasCTA && userCount >= this.qThreshold) {
      const next = this.data.messages.concat([{ type: 'cta' }])
      this.setData({ messages: next, scrollInto: 'end-anchor' })
    }
  },
  onStartMatch() {
    const records = (this.data.messages || [])
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content || '' }))
    const payloadText = JSON.stringify({ records })
    wx.navigateTo({
      url: '/pages/wait/wait',
      success: (res) => {
        res.eventChannel && res.eventChannel.emit('matchPayload', { messages: payloadText, match_id: 0 })
      }
    })
  }
})
