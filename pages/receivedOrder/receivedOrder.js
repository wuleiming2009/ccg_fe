const ccgapi = require('../../api/ccgapi')

Page({
  data: {
    order_id: 0,
    product: {},
    quantity: 1,
    order_status: 0,
    status_text: '',
    recipient: {},
    send_user_name: '',
    create_time: ''
  },
  onLoad(query) {
    const ec = this.getOpenerEventChannel && this.getOpenerEventChannel()
    if (ec && typeof ec.on === 'function') {
      ec.on('order', (info) => { this.applyInfo(info); wx.showShareMenu && wx.showShareMenu({ withShareTicket: true }) })
    }
    const oid = Number(query && (query.orderId || query.order_id)) || 0
    if (oid) {
      this.fetch(oid)
      wx.showShareMenu && wx.showShareMenu({ withShareTicket: true })
    }
  },
  async fetch(order_id) {
    try {
      const info = await ccgapi.orderInfo({ order_id })
      this.applyInfo(info)
    } catch (e) { wx.showToast({ title: '加载失败', icon: 'none' }) }
  },
  applyInfo(info) {
    const s = Number(info.order_status || 0)
    const text = (function(x){
      if (x === 0) return '待支付'
      if (x === 1) return '已支付'
      if (x === 2) return '已取消'
      if (x === 3) return '已发货'
      if (x === 4) return '已关闭'
      if (x === 5) return '已退款'
      return ''
    })(s)
    this.setData({
      order_id: Number(info.order_id) || 0,
      product: info.product || {},
      quantity: Number(info.quantity || 1),
      order_status: s,
      status_text: text,
      recipient: info.recipient || {},
      send_user_name: info.send_user_name || '',
      create_time: info.create_time || ''
    })
  }
})
