const ccgapi = require('../../api/ccgapi')

Page({
  data: { orders: [], page: 1, hasMore: true },
  onLoad() {
    this.fetch()
  },
  async fetch() {
    try {
      const p = this.data.page || 1
      const resp = await ccgapi.recipientOrderList({ page: p })
      const list = (resp.list || []).map((o) => ({
        order_id: String(o.order_id || ''),
        img_url: String((o.product && o.product.img_url) || '').replace(/`/g, '').trim(),
        name: (o.product && o.product.name) || '',
        qty: Number(o.quantity || 1),
        send_user_name: o.send_user_name || '',
        create_time: o.create_time || '',
        order_status_text: (function(s){
          if (s === 0) return '待支付'
          if (s === 1) return '已支付'
          if (s === 2) return '已取消'
          if (s === 3) return '已发货'
          if (s === 4) return '已关闭'
          if (s === 5) return '已退款'
          return ''
        })(o.order_status)
      }))
      const merged = (this.data.orders || []).concat(list)
      this.setData({ orders: merged, page: p + 1, hasMore: list.length > 0 })
    } catch (e) {
      wx.showToast({ title: '获取失败', icon: 'none' })
    }
  },
  onLoadMore() { if (this.data.hasMore) this.fetch() },
  async onOpenOrder(e) {
    const id = String(e.currentTarget.dataset.id)
    if (!id) return
    try {
      const info = await ccgapi.orderInfo({ order_id: Number(id) })
      wx.navigateTo({ url: '/pages/receivedOrder/receivedOrder', success: (res) => { res.eventChannel && res.eventChannel.emit('order', info) } })
    } catch (err) {
      wx.showToast({ title: '获取订单失败', icon: 'none' })
    }
  }
})
