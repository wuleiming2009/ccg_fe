const ccgapi = require('../../api/ccgapi')
Page({
  data: {
    reason: '',
    product: {
      image: '',
      tag: '',
      title: '',
      price: '¥—',
      desc: ''
    },
    buy_url: '',
    messages: '',
    match_id: 0
  },
  onLoad() {
    const ec = this.getOpenerEventChannel && this.getOpenerEventChannel()
    if (ec) {
      ec.on('matchResult', (data) => {
        const mapped = data.products && data.products[0] ? {
          reason: data.reason || '',
          product: {
            image: data.products[0].img_url || '',
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
      ec.on('matchId', (id) => {
        this.setData({ match_id: (typeof id === 'number' ? id : (Number(id) || 0)) })
      })
    }
  },
  onChangeGift() {
    const messages = this.data.messages || ''
    const match_id = (typeof this.data.match_id === 'number' ? this.data.match_id : (Number(this.data.match_id) || 0))
    wx.navigateTo({
      url: '/pages/wait/wait',
      success: (res) => {
        res.eventChannel && res.eventChannel.emit('matchPayload', { messages, match_id })
      }
    })
  },
  onRestart() {
    wx.redirectTo({ url: '/pages/chat/chat?reset=1' })
  },
  async onBuy() {
    try {
      const match_id = typeof this.data.match_id === 'number' ? this.data.match_id : (Number(this.data.match_id) || 0)
      const mi = await ccgapi.matchInfo({ match_id })
      const p = (mi.products && mi.products[0]) || {}
      const pid = Number(p.product_id) || 0
      if (!pid) { wx.showToast({ title: '商品信息暂不可用', icon: 'none' }); return }
      const infoResp = await ccgapi.productInfo({ product_id: pid })
      wx.navigateTo({
        url: '/pages/product/product',
        success: (res) => {
          res.eventChannel && res.eventChannel.emit('product', infoResp.info)
        }
      })
    } catch (e) {
      wx.showToast({ title: '获取商品失败', icon: 'none' })
    }
  }
  
})
