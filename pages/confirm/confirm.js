Page({
  data: {
    product: { product_id: 0, name: '', img_url: '', price: 0 },
    qty: 1,
    total: 0,
    method: 'recipient_fill',
    name: '',
    phone: '',
    address: '',
    rawText: '',
    recipients: [],
    selectedRecId: '',
    selectedRecipient: null,
    recCurrent: 0,
    showRecipient: false,
    recipientForm: { nickname: '', phone: '', address: '' },
    recipientRawText: '',
    showEditRecipient: false,
    editRecipientForm: { recipient_id: '', nickname: '', phone: '', address: '', is_default: 0 }
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
  onShow() {
    if (this.data.method === 'self_fill') this.fetchRecipients(this.data.selectedRecId)
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
    this.setData({ method: val || 'recipient_fill' }, () => {
      if (this.data.method === 'self_fill') this.fetchRecipients(this.data.selectedRecId)
    })
  },
  async fetchRecipients(preferId) {
    if (this._recipientLoading) return
    this._recipientLoading = true
    try {
      const ccgapi = require('../../api/ccgapi')
      const resp = await ccgapi.recipientList({ page: 1 })
      const list = (resp.list || resp.recipients || []).map((r, i) => ({
        id: String(r.recipient_id || r.id || i + 1),
        name: r.nickname || r.name || '',
        phone: r.phone || '',
        address: r.address || '',
        is_default: String(r.is_default) === '1' ? 1 : 0
      }))
      const prefer = preferId ? list.find(r => r.id === String(preferId)) : null
      const defaultItem = list.find(r => String(r.is_default) === '1') || null
      const chosen = prefer || defaultItem || (list.length ? list[0] : null)
      const selId = chosen ? chosen.id : ''
      const curIndex = selId ? Math.max(0, list.findIndex(r => r.id === selId)) : 0
      const shouldFill = !!chosen && (!this.data.name && !this.data.phone && !this.data.address)
      this.setData({
        recipients: list,
        selectedRecId: selId,
        selectedRecipient: chosen,
        recCurrent: curIndex >= 0 ? curIndex : 0,
        name: shouldFill ? (chosen.name || '') : this.data.name,
        phone: shouldFill ? (chosen.phone || '') : this.data.phone,
        address: shouldFill ? (chosen.address || '') : this.data.address
      })
    } catch (e) {
      this.setData({ recipients: [], selectedRecId: '', selectedRecipient: null, recCurrent: 0 })
      wx.showToast({ title: '收货人地址获取失败', icon: 'none' })
    } finally {
      this._recipientLoading = false
    }
  },
  selectRecipient(e) {
    const id = String(e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.id || '')
    const list = this.data.recipients || []
    const idx = list.findIndex(r => r.id === id)
    if (idx < 0) return
    const chosen = list[idx]
    this.setData({
      recCurrent: idx,
      selectedRecId: id,
      selectedRecipient: chosen,
      name: chosen.name || '',
      phone: chosen.phone || '',
      address: chosen.address || ''
    })
  },
  onRecSwiperChange(e) {
    const idx = Number(e && e.detail && e.detail.current) || 0
    const list = this.data.recipients || []
    const chosen = list[idx] || null
    this.setData({
      recCurrent: idx,
      selectedRecId: chosen ? chosen.id : '',
      selectedRecipient: chosen,
      name: chosen ? (chosen.name || '') : this.data.name,
      phone: chosen ? (chosen.phone || '') : this.data.phone,
      address: chosen ? (chosen.address || '') : this.data.address
    })
  },
  openRecipient() { this.setData({ showRecipient: true, recipientForm: { nickname: '', phone: '', address: '' }, recipientRawText: '' }) },
  closeRecipient() { this.setData({ showRecipient: false }) },
  onRecName(e) { this.setData({ recipientForm: { ...this.data.recipientForm, nickname: e.detail.value } }) },
  onRecPhone(e) { this.setData({ recipientForm: { ...this.data.recipientForm, phone: e.detail.value } }) },
  onRecAddr(e) { this.setData({ recipientForm: { ...this.data.recipientForm, address: e.detail.value } }) },
  onRecRawInput(e) { this.setData({ recipientRawText: e.detail.value }) },
  onRecChooseAddress() {
    if (!wx.chooseAddress) { wx.showToast({ title: '当前版本不支持地址簿', icon: 'none' }); return }
    wx.chooseAddress({
      success: (res) => {
        const nickname = res.userName || ''
        const phone = res.telNumber || ''
        const address = `${res.provinceName || ''}${res.cityName || ''}${res.countyName || ''}${res.detailInfo || ''}`
        this.setData({ recipientForm: { ...this.data.recipientForm, nickname, phone, address } })
      },
      fail: () => wx.showToast({ title: '打开地址簿失败', icon: 'none' })
    })
  },
  onRecPasteRecognize() {
    const setData = (nickname, phone, address) => this.setData({ recipientForm: { ...this.data.recipientForm, nickname, phone, address } })
    const tryParse = (txt) => {
      const phoneMatch = txt.match(/(?:\+?86[-\s]?)?(1[3-9]\d{9})/)
      const phone = phoneMatch ? phoneMatch[1] : ''
      const removedPhone = phoneMatch ? phoneMatch[0] : ''
      let cleaned = txt.replace(removedPhone, ' ').replace(/[，,;；]/g, ' ').replace(/\s+/g, ' ').trim()
      const honorMatch = cleaned.match(/(.{1,8}?(先生|女士|小姐|同学|老师))/)
      let nickname = ''
      let address = ''
      if (honorMatch) {
        nickname = honorMatch[1].trim()
        address = cleaned.replace(honorMatch[1], '').trim()
      } else {
        const tokens = cleaned.split(' ')
        const first = tokens[0] || ''
        const addrKeywords = /(省|市|区|县|镇|乡|村|道|路|街|巷|弄|号|室|楼|栋)/
        if (addrKeywords.test(first) || first.length > 16) {
          nickname = ''
          address = cleaned
        } else {
          nickname = first
          address = tokens.slice(1).join(' ').trim()
        }
      }
      setData(nickname, phone, address)
      wx.showToast({ title: '已识别', icon: 'none' })
    }
    const raw = String(this.data.recipientRawText || '').trim()
    if (raw) { tryParse(raw); return }
    wx.getClipboardData({
      success: (res) => {
        const txt = String(res.data || '').trim()
        if (!txt) { wx.showToast({ title: '剪贴板为空', icon: 'none' }); return }
        this.setData({ recipientRawText: txt })
        tryParse(txt)
      },
      fail: () => wx.showToast({ title: '无法读取剪贴板', icon: 'none' })
    })
  },
  async saveRecipient() {
    const nickname = String(this.data.recipientForm && this.data.recipientForm.nickname || '').trim()
    const phone = String(this.data.recipientForm && this.data.recipientForm.phone || '').trim()
    const address = String(this.data.recipientForm && this.data.recipientForm.address || '').trim()
    if (!nickname || !phone || !address) { wx.showToast({ title: '请填写完整信息', icon: 'none' }); return }
    try {
      const ccgapi = require('../../api/ccgapi')
      await ccgapi.recipientAdd({ nickname, phone, address })
      this.setData({ showRecipient: false })
      await this.fetchRecipients()
      wx.showToast({ title: '已保存', icon: 'none' })
    } catch (_) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },
  onEditRecipient(e) {
    const id = String(e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.id || '')
    const rec = (this.data.recipients || []).find(r => r.id === id)
    if (!rec) return
    this.setData({
      showEditRecipient: true,
      editRecipientForm: {
        recipient_id: id,
        nickname: rec.name || '',
        phone: rec.phone || '',
        address: rec.address || '',
        is_default: rec.is_default ? 1 : 0
      }
    })
  },
  closeEditRecipient() { this.setData({ showEditRecipient: false }) },
  onEditName(e) { this.setData({ editRecipientForm: { ...this.data.editRecipientForm, nickname: e.detail.value } }) },
  onEditPhone(e) { this.setData({ editRecipientForm: { ...this.data.editRecipientForm, phone: e.detail.value } }) },
  onEditAddr(e) { this.setData({ editRecipientForm: { ...this.data.editRecipientForm, address: e.detail.value } }) },
  onEditDefaultToggle(e) { this.setData({ editRecipientForm: { ...this.data.editRecipientForm, is_default: e.detail.value ? 1 : 0 } }) },
  async saveEditRecipient() {
    const f = this.data.editRecipientForm || {}
    const recipient_id = String(f.recipient_id || '')
    const nickname = String(f.nickname || '').trim()
    const phone = String(f.phone || '').trim()
    const address = String(f.address || '').trim()
    const is_default = Number(f.is_default) || 0
    if (!recipient_id || !nickname || !phone || !address) { wx.showToast({ title: '请填写完整信息', icon: 'none' }); return }
    try {
      const ccgapi = require('../../api/ccgapi')
      await ccgapi.recipientEdit({ recipient_id: Number(recipient_id), nickname, phone, address, is_default })
      this.setData({ showEditRecipient: false })
      await this.fetchRecipients(recipient_id)
      wx.showToast({ title: '已更新', icon: 'none' })
    } catch (_) {
      wx.showToast({ title: '更新失败', icon: 'none' })
    }
  },
  onDeleteRecipient(e) {
    const id = String(e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.id || '')
    if (!id) return
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确定删除该收礼人吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const ccgapi = require('../../api/ccgapi')
            await ccgapi.recipientDel({ recipient_id: Number(id) })
            wx.showToast({ title: '已删除', icon: 'none' })
            await this.fetchRecipients()
          } catch (_) {
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
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
    wx.showLoading({ title: '处理中…', mask: true })
    const ccgapi = require('../../api/ccgapi')
    const recipient_id = (m === 'recipient_fill')
      ? 999
      : Number(this.data.selectedRecId)
    if (m === 'self_fill' && !recipient_id) {
      wx.hideLoading()
      wx.showToast({ title: '请先选择收货人地址', icon: 'none' })
      return
    }
    ccgapi.orderNew({ product_id, quantity, recipient_id }).then(async (newResp) => {
      const order_id = Number(newResp && newResp.order_id) || 0
      if (!order_id) { wx.hideLoading(); wx.showToast({ title: '创建订单失败', icon: 'none' }); return }
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
