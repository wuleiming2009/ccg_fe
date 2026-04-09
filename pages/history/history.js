const ccgapi = require('../../api/ccgapi')

const TAG_COLORS = ['orange', 'green', 'purple', 'blue', 'pink']

const TAG_LIST = ['生日礼物', '纪念日', '表白礼物', '送父母', '送朋友', '送同事', '节日礼物', '乔迁之喜']

function getRandomTag() {
  return TAG_LIST[Math.floor(Math.random() * TAG_LIST.length)]
}

function getTagColor(index) {
  return TAG_COLORS[index % TAG_COLORS.length]
}

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
      const list = (resp.list || []).map((it, idx) => {
        const orderId = it.order_id || 0
        const orderStatus = it.order_status || 0
        const hasOrder = orderId > 0
        const product = hasOrder ? it.order_product_name : (it.name || '管家推荐礼物')
        const price = hasOrder ? (it.order_product_price / 100) : ((it.price || 0) / 100)
        const status = hasOrder ? (orderStatus === 1 ? '已加购' : '已下单') : 'pending'
        const isDone = hasOrder && (orderStatus === 1 || orderStatus === 2)
        const tags = it.tag ? it.tag.split(',').filter(t => t) : []
        return {
          match_id: it.match_id,
          date: it.time ? it.time.substring(0, 10) : '',
          price: price,
          demand: it.match_text || '想挑选一份合适的礼物',
          product: product,
          tag1: tags[0] || getRandomTag(),
          tag2: tags[1] || getRandomTag(),
          tag3: tags[2] || '',
          tag1Color: getTagColor(idx * 2),
          tag2Color: getTagColor(idx * 2 + 1),
          tag3Color: getTagColor(idx * 2 + 2),
          status: status,
          statusIcon: isDone ? '✓' : '·',
          statusText: isDone ? status : '未下单',
          statusClass: isDone ? 'status-done' : 'status-pending'
        }
      })
      const items = p === 1 ? list : this.data.items.concat(list)
      this.setData({
        items,
        empty: items.length === 0,
        page: p,
        hasMore: list.length > 0
      })
    } catch (e) {
      console.error('matchList error:', e)
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
  onViewResult(e) {
    const id = Number(e.currentTarget.dataset.id)
    wx.setStorageSync('lastMatchId', id)
    wx.switchTab({
      url: '/pages/chat/chat'
    })
  }
})