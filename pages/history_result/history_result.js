const ccgapi = require('../../api/ccgapi')

Page({
  data: {
    reason: '',
    product: { image: '/images/gift.png', tag: 'AI推荐礼物', title: '', price: '¥—', desc: '' },
    buy_url: '',
    match_id: 0
  },
  onLoad(options) {
    const ec = this.getOpenerEventChannel && this.getOpenerEventChannel()
    if (ec) {
      ec.on('matchId', (id) => {
        const mid = typeof id === 'number' ? id : (Number(id) || 0)
        this.setData({ match_id: mid })
        this.fetchInfo(mid)
      })
    }
    if (options && options.match_id) {
      const mid = Number(options.match_id) || 0
      this.setData({ match_id: mid })
      this.fetchInfo(mid)
    }
  },
  async fetchInfo(match_id) {
    try {
      const resp = await ccgapi.matchInfo({ match_id })
      const p = (resp.products && resp.products[0]) || {}
      const mapped = {
        reason: resp.reason || '',
        product: {
          image: p.img_url || '/images/gift.png',
          tag: p.match_meaning,
          title: p.name || '',
          price: p.price ? ('¥' + p.price) : '¥—',
          desc: p.match_text
        },
        buy_url: p.buy_url || ''
      }
      this.setData(mapped)
    } catch (e) {
      wx.showToast({ title: '获取结果失败', icon: 'none' })
    }
  },
  onBuy() {
    if (this.data.buy_url) {
      wx.setClipboardData({ data: this.data.buy_url, success: () => wx.showToast({ title: '购买链接已复制', icon: 'none' }) })
    } else {
      wx.showToast({ title: '暂未提供购买链接', icon: 'none' })
    }
  }
})
