const ccgapi = require('../../api/ccgapi')

Page({
  data: {
    reason: '',
    product: { image: '', tag: '', title: '', price: '¥—', desc: '' },
    buy_url: '',
    match_id: 0,
    product_id: 0
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
          image: p.img_url || '',
          tag: p.match_meaning,
          title: p.name || '',
          price: p.price ? ('¥' + p.price) : '¥—',
          desc: p.match_text
        },
        buy_url: p.buy_url || '',
        product_id: Number(p.product_id) || 0
      }
      this.setData(mapped)
    } catch (e) {
      wx.showToast({ title: '获取结果失败', icon: 'none' })
    }
  },
  async onBuy() {
    try {
      const pid = typeof this.data.product_id === 'number' ? this.data.product_id : (Number(this.data.product_id) || 0)
      if (!pid) { wx.showToast({ title: '商品信息暂不可用', icon: 'none' }); return }
      const infoResp = await ccgapi.productInfo({ product_id: pid })
      console.log("wwww : "+JSON.stringify(infoResp))
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
