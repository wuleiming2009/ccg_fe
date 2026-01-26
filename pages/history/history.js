const ccgapi = require('../../api/ccgapi')

Page({
  data: {
    items: [],
    empty: true,
    page: 1,
    hasMore: true,
    loading: false
  },
  onLoad() {
    this.fetchPage(1)
  },
  async fetchPage(p) {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const resp = await ccgapi.matchList({ page: p })
      const list = (resp.list || []).map(it => ({
        match_id: it.match_id,
        title: it.name || '礼物',
        date: it.Time || '',
        price: it.price || 0,
        preview: it.match_text || '',
        thumb: it.img_url || ''
      }))
      const items = p === 1 ? list : this.data.items.concat(list)
      this.setData({
        items,
        empty: items.length === 0,
        page: p,
        hasMore: list.length > 0
      })
    } catch (e) {
        console.error('matchList error:', e)
      // 不使用本地mock，保持空列表显示“暂无记录”
      if (p === 1) {
        this.setData({ items: [], empty: true, hasMore: false })
      }
    } finally {
      this.setData({ loading: false })
    }
  },
  onReachBottom() {
    if (!this.data.hasMore) return
    this.fetchPage(this.data.page + 1)
  },
  onReview(e) {
    const id = Number(e.currentTarget.dataset.id)
    ccgapi.matchInfo({ match_id: id }).then((resp) => {
      const messages = typeof resp.messages === 'string' ? resp.messages : JSON.stringify(resp.messages || { records: [] })
      wx.navigateTo({
        url: '/pages/review/review',
        success: (res) => {
          res.eventChannel && res.eventChannel.emit('messages', messages)
        }
      })
    }).catch(() => {
      wx.showToast({ title: '获取对话失败', icon: 'none' })
    })
  },
  onViewResult(e) {
    const id = Number(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '/pages/history_result/history_result',
      success: (res) => {
        res.eventChannel && res.eventChannel.emit('matchId', id)
      }
    })
  }
})
