const ccgapi = require('../../api/ccgapi')

Page({
  data: {
    order_id: '',
    product: {},
    recipient: {},
    quantity: 0,
    amount_total: '0.00',
    status_text: '',
    order_status: -1,
    order_date: '',
    create_time: ''
  },
  onLoad(options) {
    const ec = this.getOpenerEventChannel && this.getOpenerEventChannel()
    if (ec) {
      ec.on('order', (info) => {
        const statusMap = { 0: '待支付', 1: '已支付', 2: '已取消', 3: '已发货', 4: '已关闭', 5: '已退款' }
        this.setData({
          order_id: info.order_id,
          product: info.product || {},
          recipient: info.recipient || {},
          quantity: info.quantity || 0,
          amount_total: info.amount_total || '0.00',
          status_text: statusMap[info.order_status] || info.order_status_text || '',
          order_status: (typeof info.order_status === 'number' ? info.order_status : (Number(info.order_status) || -1)),
          order_date: info.date || '',
          create_time: info.create_time || ''
        })
      })
    }
  },
  async onPay() {
    try {
      const id = Number(this.data.order_id) || 0
      if (!id) { wx.showToast({ title: '订单无效', icon: 'none' }); return }
      wx.showLoading({ title: '拉起支付…', mask: true })
      const prepay = await ccgapi.paymentPrepay({ order_id: id })
      wx.hideLoading()
      const timeStamp = String(prepay.time_stamp || prepay.timeStamp || '')
      const nonceStr = String(prepay.nonce_str || prepay.nonceStr || '')
      const pkg = String(prepay.package || '')
      const signType = String(prepay.sign_type || prepay.signType || 'MD5')
      const paySign = String(prepay.paySign || prepay.paysign || '')
      if (!timeStamp || !nonceStr || !pkg || !paySign) {
        wx.showToast({ title: '支付参数不完整', icon: 'none' })
        return
      }
      wx.requestPayment({
        timeStamp,
        nonceStr,
        package: pkg,
        signType,
        paySign,
        success: () => {
          wx.showToast({ title: '支付成功', icon: 'none' })
          this.setData({ status_text: '已支付', order_status: 1 })
        },
        fail: (err) => {
          wx.showToast({ title: (err && err.errMsg) || '支付失败', icon: 'none' })
        }
      })
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: '预支付失败', icon: 'none' })
    }
  }
})
