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
    const url = this.data.buy_url || ''
    if (!url) { wx.showToast({ title: '暂未提供购买链接', icon: 'none' }); return }
    if (/^https?:\/\//.test(url)) {
      wx.navigateTo({ url: '/pages/webview/webview?url=' + encodeURIComponent(url) })
      return
    }
    if (url.indexOf('#小程序://京东购物') === 0) {
      wx.navigateToMiniProgram({
        appId: 'wx91d27dbf599dff74',
        path: 'pages/proxy/union/union?spreadUrl=' + encodeURIComponent(url),
        envVersion: 'release',
        fail: () => wx.setClipboardData({ data: url, success: () => wx.showToast({ title: '已复制京东小程序短链', icon: 'none' }) })
      })
      return
    }
    wx.setClipboardData({ data: url, success: () => wx.showToast({ title: '购买链接已复制', icon: 'none' }) })
  }
})
