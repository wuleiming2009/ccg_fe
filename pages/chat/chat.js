Page({
  data: {
    greeting: '',
    welcomStr: '',
    messages: [],
    inputValue: '',
    scrollInto: ''
  },
  onLoad() {
    const app = getApp()
    this.client = app && app.globalData && app.globalData.aiClient
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
      const resp = await this.client.chat({ messages: msgs })
      const list = this.data.messages.slice()
      const typingIndex = list.length - 1
      list[typingIndex] = { role: 'assistant', content: resp.content || '（无回复）' }
      this.setData({ messages: list, scrollInto: 'end-anchor' })
    } catch (e) {
      wx.showToast({ title: '发送失败', icon: 'none' })
      console.error('chat send error', e)
    }
  }
})
