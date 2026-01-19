Page({
  data: {
    messages: [],
    scrollInto: 'end-anchor'
  },
  onLoad() {
    const ec = this.getOpenerEventChannel && this.getOpenerEventChannel()
    if (ec) {
      ec.on('messages', (text) => {
        try {
          const obj = JSON.parse(text || '{}')
          const msgs = Array.isArray(obj.records) ? obj.records : []
          this.setData({ messages: msgs, scrollInto: 'end-anchor' })
        } catch (e) {
          const fallback = [
            { role: 'assistant', content: '嗨！我是你的专属礼赠顾问。最近是有什么开心的事，还是遇到了什么送礼的难题？跟我说说，我来帮你参考参考～' },
            { role: 'user', content: '儿子生气了' }
          ]
          this.setData({ messages: fallback })
        }
      })
    }
  }
})
