const ccgapi = require('../../api/ccgapi')

Page({
  data: {
    items: [],
    page: 1,
    hasMore: true,
    loading: false,
    palette: ['#8CB4B4','#BFD6D6','#A6C8C8','#8FAFAD','#9EC3BE']
  },
  onLoad() {
    this.fetchPage(1)
    wx.showShareMenu({ withShareTicket: true })
  },
  async fetchPage(p) {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const resp = await ccgapi.marketList({ page: p })
      const list = (resp.list || []).map((it, idx) => ({
          product_id: it.product_id || 0,
          img_url: it.img_url,
          name: it.name,
          price: it.price,
          slogan: it.slogan || '',
          contents: it.contents || '',
          scene: it.scene || '',
          keywords: it.keywords || '',
          match_text: it.match_text,
          match_meaning: it.match_meaning,
      }))
      const items = p === 1 ? list : this.data.items.concat(list)
      this.setData({ items, page: p, hasMore: list.length > 0 })
    } catch (e) {
      wx.showToast({ title: '加载市集失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },
  onOpenDetail(e) {
    const idx = Number(e.currentTarget.dataset.index)
    const item = this.data.items[idx]
    if (!item) return
    wx.navigateTo({
      url: '/pages/product/product',
      success: (res) => {
        res.eventChannel && res.eventChannel.emit('product', item)
      }
    })
  },
  onReachBottom() {
    if (!this.data.hasMore) return
    this.fetchPage(this.data.page + 1)
  },
  onPullDownRefresh() {
    this.fetchPage(1).finally(() => wx.stopPullDownRefresh())
  },
  onShareAppMessage() {
    return { title: 'CC GIFT 礼物集市', path: '/pages/market/market' }
  }
})
