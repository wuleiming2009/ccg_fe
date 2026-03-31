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
        const demand = it.match_text || '想挑选一份合适的礼物'
        const product = it.name || '管家推荐礼物'
        const status = it.status || 'pending'
        const isDone = status === '已下单' || status === '已加购'
        return {
          match_id: it.match_id,
          date: it.Time ? it.Time.substring(0, 10) : '',
          price: it.price || 0,
          demand: demand,
          product: product,
          tag1: getRandomTag(),
          tag2: getRandomTag(),
          tag1Color: getTagColor(idx * 2),
          tag2Color: getTagColor(idx * 2 + 1),
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
    wx.navigateTo({
      url: '/pages/history_result/history_result',
      success: (res) => {
        res.eventChannel && res.eventChannel.emit('matchId', id)
      }
    })
  }
})