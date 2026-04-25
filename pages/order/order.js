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
    create_time: '',
    showInviteConfirm: false,
    inviteName: '',
    pictures: []
  },
  onPreviewImage(e) {
    try {
      const idx = Number((e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.index) || 0)
      const arr = (Array.isArray(this.data.pictures) && this.data.pictures.length) ? this.data.pictures
        : (this.data.product && this.data.product.img_url ? [this.data.product.img_url] : [])
      if (!arr.length) return
      const current = arr[idx] || arr[0]
      wx.previewImage({ current, urls: arr })
    } catch (_) {}
  },
  onCopyTransport() {
    try {
      const t = this.data.transport || {}
      const text = String(t.transport_no || '').trim()
      if (!text) { wx.showToast({ title: '无物流信息', icon: 'none' }); return }
      wx.setClipboardData({
        data: text,
        success: () => wx.showToast({ title: '已复制', icon: 'none' }),
        fail: () => wx.showToast({ title: '复制失败', icon: 'none' })
      })
    } catch (_) { wx.showToast({ title: '复制失败', icon: 'none' }) }
  },
  onLoad(options) {
    const ec = this.getOpenerEventChannel && this.getOpenerEventChannel()
    if (ec && typeof ec.on === 'function') {
      ec.on('order', (info) => { this.applyInfo(info); wx.showShareMenu && wx.showShareMenu({ withShareTicket: true }) })
    }
    const oid = Number((options && (options.orderId || options.order_id)) || 0)
    if (oid) {
      this.fetch(oid)
      wx.showShareMenu && wx.showShareMenu({ withShareTicket: true })
    }
  },
  async fetch(order_id) {
    try {
      const info = await ccgapi.orderInfo({ order_id })
      this.applyInfo(info)
    } catch (e) {
      wx.showToast({ title: '加载订单失败', icon: 'none' })
    }
  },
  applyInfo(info) {
    const statusMap = { 0: '待支付', 1: '已支付', 2: '已取消', 3: '已发货', 4: '已关闭', 5: '已退款' }
    const recipientId = Number(info.recipient_id || (info.recipient && info.recipient.recipient_id) || 0)
    const product = info.product || {}
    const toNum = (s) => { const n = parseFloat(String(s || '').replace(/[^\d.]/g, '')); return isNaN(n) ? 0 : n }
    const picsStr = String(
      product.pictures || product.Pictures || product.prictures || product.Pictures ||
      info.pictures || info.Pictures || info.prictures || info.Pictures || ''
    ).trim()
    const pictures = picsStr
      ? picsStr.split(/[,，]/).map(s => String(s || '').trim()).filter(s => !!s && /^https?:\/\//.test(s))
      : []
    const qty = Number(info.quantity || 0)
    const total = toNum(info.amount_total || '0.00')
    const unit = qty > 0 ? (total / qty).toFixed(2) : (product.price || '0.00')
    this.setData({
      order_id: info.order_id,
      product,
      pictures,
      recipient: info.recipient || {},
      recipient_id: recipientId,
      quantity: qty,
      unit_price: unit,
      amount_total: info.amount_total || '0.00',
      status_text: statusMap[info.order_status] || info.order_status_text || '',
      order_status: (typeof info.order_status === 'number' ? info.order_status : (Number(info.order_status) || -1)),
      order_date: info.date || '',
      create_time: info.create_time || '',
      isInvite: recipientId === 999,
      transport: info.transport || {}
    })
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
          this.requestSubscribeMessage()
        },
        fail: (err) => {
          wx.showToast({ title: (err && err.errMsg) || '支付失败', icon: 'none' })
        }
      })
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: '预支付失败', icon: 'none' })
    }
  },
  requestSubscribeMessage() {
    const env = require('../../config/env')
    const tmplId = env && env.orderMsgTemplateId
    console.log('requestSubscribeMessage called, tmplId:', tmplId)
    if (!tmplId || !wx.requestSubscribeMessage) {
      console.log('early return: tmplId=', tmplId, 'requestSubscribeMessage=', !!wx.requestSubscribeMessage)
      return
    }
    wx.requestSubscribeMessage({
      tmplIds: [tmplId],
      success: (res) => console.log('subscribe success', res),
      fail: (err) => console.log('subscribe fail', err),
      complete: () => console.log('subscribe complete')
    })
  },
  onShareAppMessage() {
    const id = Number(this.data.order_id) || 0
    const path = `/pages/invite/invite?order_id=${id}`
    const env = require('../../config/env')
    const prodImg = (Array.isArray(this.data.pictures) && this.data.pictures[0]) || (this.data.product && this.data.product.img_url) || ''
    const fallback = 'https://wumuxuan-1253516064.cos.ap-shanghai.myqcloud.com/ccg/uni-app/4d35825d420247f8acd224f66e281cb2.png'
    const imageUrl = /^https?:\/\//.test(prodImg) ? prodImg : fallback
    return { title: '填写收礼地址邀请', path, imageUrl }
  }
  ,onInviteIdentity() {
    const uc = wx.getStorageSync('userConfig') || {}
    const nm = uc && (uc.user_name || '')
    this.setData({ showInviteConfirm: true, inviteName: nm })
  }
  ,onInviteCancel() { this.setData({ showInviteConfirm: false }) }
  ,onInviteNameInput(e) { this.setData({ inviteName: e.detail.value }) }
  ,onInviteSend() {
    const name = String(this.data.inviteName || '').trim()
    if (!name) { wx.showToast({ title: '请填写称呼', icon: 'none' }); return }
    const ccgapi = require('../../api/ccgapi')
    const oid = Number(this.data.order_id) || 0
    const p1 = ccgapi.setInfo({ user_name: name, wx_nickname: name }).catch(() => {})
    const p2 = oid ? ccgapi.setSendName({ order_id: oid, send_user_name: name }).catch(() => {}) : Promise.resolve()
    Promise.all([p1, p2]).then(() => {
      const cur = wx.getStorageSync('userConfig') || {}
      cur.user_name = name
      wx.setStorageSync('userConfig', cur)
    }).finally(() => {
      this.setData({ showInviteConfirm: false })
    })
  }
  ,onOpenTracking(e) {
    const nu = String(e.currentTarget.dataset.nu || '').trim()
    const com = String(e.currentTarget.dataset.com || '').trim()
    const provider = String(e.currentTarget.dataset.provider || 'kuaidi100').trim()
    const { buildLogisticsUrl } = require('../../utils/logistics')
    const url = buildLogisticsUrl({ nu, com, provider })
    if (!url || !/^https:/.test(url)) { wx.showToast({ title: '链接无效', icon: 'none' }); return }
    wx.navigateTo({ url: '/pages/webview/webview?url=' + encodeURIComponent(url) })
  }
})
