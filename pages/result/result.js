Page({
  data: {
    reason: '',
    product: {
      image: '/images/gift.png',
      tag: '创意治愈礼盒',
      title: '‘病号快乐箱’主题礼盒',
      price: '¥188',
      desc: '一个装满黑色幽默与实用关怀的治愈系礼盒（示例）。'
    },
    buy_url: '',
    messages: ''
  },
  onLoad() {
    const ec = this.getOpenerEventChannel && this.getOpenerEventChannel()
    if (ec) {
      ec.on('matchResult', (data) => {
        const mapped = data.products && data.products[0] ? {
          reason: data.reason || '',
          product: {
            image: data.products[0].img_url || '/images/gift.png',
            tag: data.products[0].match_meaning || '',
            title: data.products[0].name || '',
            price: data.products[0].price ? ('¥' + data.products[0].price) : '¥—',
            desc: data.products[0].match_text || ''
          },
          buy_url: data.products[0].buy_url || ''
        } : data
        this.setData(mapped)
      })
      ec.on('matchMessages', (msg) => {
        this.setData({ messages: msg || '' })
      })
    }
  },
  onChangeGift() {
    const messages = this.data.messages || ''
    wx.navigateTo({
      url: '/pages/wait/wait',
      success: (res) => {
        res.eventChannel && res.eventChannel.emit('matchPayload', { messages })
      }
    })
  },
  onRestart() {
    wx.redirectTo({ url: '/pages/chat/chat?reset=1' })
  },
  onBuy() {
    if (this.data.buy_url) {
      wx.setClipboardData({ data: this.data.buy_url, success: () => wx.showToast({ title: '购买链接已复制', icon: 'none' }) })
    } else {
      wx.showToast({ title: '暂未提供购买链接', icon: 'none' })
    }
  }
})
