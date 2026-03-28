Page({
  data: {
    product: { product_id: 0, name: '', img_url: '', price: 0 },
    qty: 1,
    total: 0,
    method: 'recipient_fill',
    name: '',
    phone: '',
    address: '',
    rawText: ''
  },
  onLoad(options) {
    let incoming = null
    if (typeof this.getOpenerEventChannel === 'function') {
      try {
        const ec = this.getOpenerEventChannel()
        ec && ec.on && ec.on('order', (payload) => this.initOrder(payload))
      } catch (_) {}
    }
    if (!incoming) {
      const name = options && options.name
      const img_url = options && options.img_url
      const price = options && options.price
      const qty = Number(options && options.qty) || 1
      if (name || img_url || price) this.initOrder({ product: { name, img_url, price }, qty })
    }
  },
  initOrder(payload) {
    try {
      const p = payload && payload.product ? payload.product : {}
      const qty = Number(payload && payload.qty) || 1
      const unit = this.parsePrice(p.price)
      const total = (unit * qty).toFixed(2)
      this.setData({
        product: { product_id: Number(p.product_id) || 0, name: p.name || '', img_url: p.img_url || '', price: (unit.toFixed ? unit.toFixed(2) : p.price) },
        qty,
        total
      })
    } catch (_) {}
  },
  parsePrice(v) {
    if (typeof v === 'number') return v
    const s = String(v || '').replace(/[^\d.]/g, '')
    const n = parseFloat(s || '0')
    return isNaN(n) ? 0 : n
  },
  onSelectMethod(e) {
    const val = e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.val
    this.setData({ method: val || 'recipient_fill' })
  },
  onName(e) { this.setData({ name: e.detail.value }) },
  onPhone(e) { this.setData({ phone: e.detail.value }) },
  onAddr(e) { this.setData({ address: e.detail.value }) },
  onRawInput(e) { this.setData({ rawText: e.detail.value }) },
  onChooseAddress() {
    if (!wx.chooseAddress) { wx.showToast({ title: '当前版本不支持地址簿', icon: 'none' }); return }
    wx.chooseAddress({
      success: (res) => {
        const name = res.userName || ''
        const phone = res.telNumber || ''
        const full = `${res.provinceName || ''}${res.cityName || ''}${res.countyName || ''}${res.detailInfo || ''}`
        this.setData({ name, phone, address: full })
      },
      fail: () => wx.showToast({ title: '打开地址簿失败', icon: 'none' })
    })
  },
  onPasteRecognize() {
    const setData = (name, phone, address) => this.setData({ name, phone, address })
    const tryParse = (txt) => {
      const phoneMatch = txt.match(/(?:\+?86[-\s]?)?(1[3-9]\d{9})/)
      const phone = phoneMatch ? phoneMatch[1] : ''
      const removedPhone = phoneMatch ? phoneMatch[0] : ''
      let cleaned = txt.replace(removedPhone, ' ').replace(/[，,;；]/g, ' ').replace(/\s+/g, ' ').trim()
      const honorMatch = cleaned.match(/(.{1,8}?(先生|女士|小姐|同学|老师))/)
      let name = ''
      let address = ''
      if (honorMatch) {
        name = honorMatch[1].trim()
        address = cleaned.replace(honorMatch[1], '').trim()
      } else {
        const tokens = cleaned.split(' ')
        const first = tokens[0] || ''
        const addrKeywords = /(省|市|区|县|镇|乡|村|道|路|街|巷|弄|号|室|楼|栋)/
        if (addrKeywords.test(first) || first.length > 16) {
          name = ''
          address = cleaned
        } else {
          name = first
          address = tokens.slice(1).join(' ').trim()
        }
      }
      setData(name, phone, address)
      wx.showToast({ title: '已识别', icon: 'none' })
    }
    const raw = String(this.data.rawText || '').trim()
    if (raw) { tryParse(raw); return }
    wx.getClipboardData({
      success: (res) => {
        const txt = String(res.data || '').trim()
        if (!txt) { wx.showToast({ title: '剪贴板为空', icon: 'none' }); return }
        this.setData({ rawText: txt })
        tryParse(txt)
      },
      fail: () => wx.showToast({ title: '无法读取剪贴板', icon: 'none' })
    })
  },
  onPay() {
    const m = this.data.method || 'recipient_fill'
    const product_id = Number(this.data.product && this.data.product.product_id) || 0
    const quantity = Number(this.data.qty || 1)
    if (!product_id) { wx.showToast({ title: '商品无效', icon: 'none' }); return }
    if (m === 'self_fill') {
      const name = (this.data.name || '').trim()
      const phone = (this.data.phone || '').trim()
      const address = (this.data.address || '').trim()
      if (!name) { wx.showToast({ title: '请填写收礼人称呼', icon: 'none' }); return }
      if (!phone || !/(?:\+?86[-\s]?)?(1[3-9]\d{9})/.test(phone)) { wx.showToast({ title: '请填写正确手机号', icon: 'none' }); return }
      if (!address) { wx.showToast({ title: '请填写详细地址', icon: 'none' }); return }
    }
    wx.showLoading({ title: '处理中…', mask: true })
    const ccgapi = require('../../api/ccgapi')
    const recipient_id = (m === 'recipient_fill') ? 999 : 0
    ccgapi.orderNew({ product_id, quantity, recipient_id }).then(async (newResp) => {
      const order_id = Number(newResp && newResp.order_id) || 0
      if (!order_id) { wx.hideLoading(); wx.showToast({ title: '创建订单失败', icon: 'none' }); return }
      if (m === 'self_fill') {
        try { await ccgapi.setOrderRecipient({ order_id, nickname: this.data.name, phone: this.data.phone, address: this.data.address }) } catch (_) {}
      }
      const prepay = await ccgapi.paymentPrepay({ order_id })
      wx.hideLoading()
      const timeStamp = String(prepay.time_stamp || prepay.timeStamp || '')
      const nonceStr = String(prepay.nonce_str || prepay.nonceStr || '')
      const pkg = String(prepay.package || '')
      const signType = String(prepay.sign_type || prepay.signType || 'MD5')
      const paySign = String(prepay.paySign || prepay.paysign || '')
      if (!timeStamp || !nonceStr || !pkg || !paySign) { wx.showToast({ title: '支付参数不完整', icon: 'none' }); return }
      wx.requestPayment({
        timeStamp, nonceStr, package: pkg, signType, paySign,
        success: async () => {
          try {
            const info = await ccgapi.orderInfo({ order_id })
            wx.navigateTo({
              url: '/pages/order/order',
              success: (res) => { res.eventChannel && res.eventChannel.emit('order', info) }
            })
          } catch (e) { wx.showToast({ title: '支付成功，获取订单失败', icon: 'none' }) }
        },
        fail: (err) => { wx.showToast({ title: (err && err.errMsg) || '支付失败', icon: 'none' }) }
      })
    }).catch(() => { wx.hideLoading(); wx.showToast({ title: '支付预下单失败', icon: 'none' }) })
  }
})
