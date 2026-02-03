const ccgapi = require('../../api/ccgapi')

Page({
  data: { recipients: [], sortMode: 'recipient', orders: [], orderPage: 1, orderHasMore: true },
  onLoad() {
    const saved = wx.getStorageSync('archiveSort') || 'recipient'
    this.setData({ sortMode: saved })
    if (saved === 'order') {
      this.setData({ orders: [], orderPage: 1, orderHasMore: true })
      this.fetchOrdersByTime()
    } else {
      this.fetchRecipientsByOrders()
    }
  },
  async fetchRecipientsByOrders() {
    try {
      const resp = await ccgapi.recipientListByOrders({ page: 1 })
      const list = (resp.list || resp.recipients || []).map((r, i) => ({
        id: String(r.recipient_id || r.id || i + 1),
        name: r.nickname || r.name || '',
        phone: r.phone || '',
        order_count: Number(r.order_count || 0),
        expanded: false,
        filter: '',
        orders: [],
        page: 1,
        hasMore: true
      }))
      this.setData({ recipients: list })
    } catch (e) {
      wx.showToast({ title: '收礼人获取失败', icon: 'none' })
    }
  },
  onChangeSort() {
    wx.showActionSheet({
      itemList: ['按收礼人排序', '按订单排序'],
      success: (res) => {
        const idx = res.tapIndex
        if (idx === 0) {
          this.setData({ sortMode: 'recipient' })
          wx.setStorageSync('archiveSort', 'recipient')
          this.fetchRecipientsByOrders()
        } else {
          this.setData({ sortMode: 'order', orders: [], orderPage: 1, orderHasMore: true })
          wx.setStorageSync('archiveSort', 'order')
          this.fetchOrdersByTime()
        }
      }
    })
  },
  async toggleRecipient(e) {
    const id = String(e.currentTarget.dataset.id)
    const arr = this.data.recipients.slice()
    const idx = arr.findIndex(x => x.id === id)
    if (idx < 0) return
    const item = arr[idx]
    item.expanded = !item.expanded
    arr[idx] = item
    this.setData({ recipients: arr })
    if (item.expanded && (!item.orders || item.orders.length === 0)) {
      await this.fetchOrders(id)
    }
  },
  async fetchOrders(recipient_id) {
    try {
      const arr = this.data.recipients.slice()
      const idx = arr.findIndex(x => x.id === String(recipient_id))
      const currentPage = idx >= 0 ? (arr[idx].page || 1) : 1
      const resp = await ccgapi.recipientOrders({ recipient_id: Number(recipient_id), page: currentPage })
      const orders = (resp.list || resp.orders || []).map((o, i) => ({
        order_id: String(o.order_id || i + 1),
        product_id: Number(o.product_id || 0),
        img_url: o.img_url || '',
        name: o.name || '',
        qty: Number(o.qty || o.quantity || 1),
        code: o.code || o.order_code || '',
        price: o.price,
        amount_total: o.amount_total,
        order_status_text: o.order_status_text || '',
        date: o.date || o.time || o.created_at || ''
      }))
      if (idx >= 0) {
        const merged = (arr[idx].orders || []).concat(orders)
        arr[idx].orders = merged
        arr[idx].page = currentPage + 1
        arr[idx].hasMore = orders.length > 0
        this.setData({ recipients: arr })
      }
    } catch (e) {
      wx.showToast({ title: '订单获取失败', icon: 'none' })
    }
  },
  onLoadMore(e) {
    const id = String(e.currentTarget.dataset.id)
    this.fetchOrders(id)
  },
  async onOpenOrder(e) {
    const id = String(e.currentTarget.dataset.id)
    if (!id) return
    try {
      const info = await ccgapi.orderInfo({ order_id: Number(id) })
      wx.navigateTo({
        url: '/pages/order/order',
        success: (res) => {
          res.eventChannel && res.eventChannel.emit('order', info)
        }
      })
    } catch (err) {
      wx.showToast({ title: '获取订单失败', icon: 'none' })
    }
  },
  async fetchOrdersByTime() {
    try {
      const page = this.data.orderPage || 1
      const resp = await ccgapi.orderListByTime({ page })
      const list = (resp.list || []).map((o) => ({
        order_id: String(o.order_id || ''),
        img_url: String((o.product && o.product.img_url) || '').replace(/`/g, '').trim(),
        name: (o.product && o.product.name) || '',
        qty: Number(o.quantity || 1),
        price: o.amount_paid || (o.product && o.product.price) || '0.00',
        recipient: (o.recipient && (o.recipient.nickname || o.recipient.phone)) || '',
        date: o.date || o.time || o.created_at || '',
        order_status_text: (function(s){
          if (s === 0) return '待支付'
          if (s === 1) return '已支付'
          if (s === 2) return '已取消'
          if (s === 3) return '已关闭'
          if (s === 4) return '已退款'
          return ''
        })(o.order_status)
      }))
      const merged = (this.data.orders || []).concat(list)
      this.setData({ orders: merged, orderPage: page + 1, orderHasMore: list.length > 0 })
    } catch (e) {
      wx.showToast({ title: '订单获取失败', icon: 'none' })
    }
  },
  onLoadMoreOrders() { this.fetchOrdersByTime() },
  onFilterInput(e) {
    const id = String(e.currentTarget.dataset.id)
    const val = e.detail.value || ''
    const arr = this.data.recipients.slice()
    const idx = arr.findIndex(x => x.id === id)
    if (idx < 0) return
    arr[idx].filter = val
    const raw = arr[idx].orders || []
    const q = val.trim().toLowerCase()
    arr[idx].filtered = q ? raw.filter(o => (o.code || '').toLowerCase().includes(q) || (o.name || '').toLowerCase().includes(q)) : raw
    this.setData({ recipients: arr })
  }
})
