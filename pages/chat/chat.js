Page({
  data: {
    greeting: '',
    welcomStr: '愿你被生活温柔以待',
    messages: [
      { role: 'assistant', content: '嗨！我是你的专属礼赠顾问。最近是有什么开心的事，还是遇到了什么送礼的难题？跟我说说，我来帮你参谋参谋～' }
    ],
    inputValue: '',
    scrollInto: ''
  },
  onLoad() {
    const app = getApp()
    this.client = app && app.globalData && app.globalData.aiClient
    const { questions, PERSONA_PROMPT } = require('../../config/chatbot')
    this.questions = questions
    this.qThreshold = Math.ceil((questions.length || 0) * 0.8)
    const qList = questions.map((q, i) => `${i + 1}. ${q}`).join('；')
    this.personaPrompt = `${PERSONA_PROMPT} 请以自然中文表达，不要输出括号或其他标记的语气/动作词，如（关切的）（轻声的）。逐步询问以下问题，至少覆盖80%，每次只问1-2个并结合上下文：${qList}。在获取足够信息后，给出预算匹配、创意与走心度兼顾的礼物建议。`
    this.setData({ scrollInto: 'end-anchor' })
  },
  onShow() {
    this.setData({ greeting: this.getGreeting() })
    const ccgapi = require('../../api/ccgapi');
    ccgapi.welcomeString({}).then((resp) => {
      this.setData({ welcomStr: resp.str })
    })
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
    console.log('查看礼赠历史')
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
    const json = { records }
    try {
      console.log('礼物匹配对话JSON:\n' + JSON.stringify(json, null, 2))
    } catch (e) {}
  }
})
