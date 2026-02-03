Page({
  data: {
    product_id: 0,
    img_url: '',
    name: '',
    price: 0,
    slogan: '',
    contents: '',
    scene: '',
    keywords: '',
    contents_fmt: '',
    scene_fmt: '',
    keywords_fmt: '',
    match_text: '',
    match_meaning: '',
    qty: 1,
    showCheckout: false,
    showRecipient: false,
    recipientForm: { nickname: '', phone: '', address: '' },
    recipient: { name: '', phone: '', address: '' },
    recipients: [],
    selectedRecId: null,
    selectedRecipient: null,
    recCurrent: 0,
    showEditRecipient: false,
    editRecipientForm: { recipient_id: '', nickname: '', phone: '', address: '', is_default: 0 },
  },
  onLoad() {
    const ec = this.getOpenerEventChannel && this.getOpenerEventChannel()
    if (ec) {
      ec.on('product', (item) => {
        const format = (t, sep) => {
          if (!t) return ''
          return String(t).split(',').map(s => s.trim()).filter(Boolean).join(sep)
        }
        this.setData({
          product_id: item.product_id || 0,
          img_url: item.img_url,
          name: item.name,
          price: item.price,
          slogan: item.slogan || '',
          contents: item.contents || '',
          scene: item.scene || '',
          keywords: item.keywords || '',
          contents_fmt: format(item.contents, ' | '),
          scene_fmt: format(item.scene, ' · '),
          keywords_fmt: format(item.keywords, ' · '),
          match_text: item.match_text,
          match_meaning: item.match_meaning,
        })
      })
    }
  },
  onInc() {
    const q = (this.data.qty || 1) + 1
    this.setData({ qty: q })
  },
  onDec() {
    const q = (this.data.qty || 1)
    if (q > 1) this.setData({ qty: q - 1 })
  },
  onGift() {
    this.setData({ showCheckout: true })
    this.fetchRecipients()
  },
  onCloseSheet() {
    this.setData({ showCheckout: false })
  },
  openRecipient() { this.setData({ showRecipient: true }) },
  closeRecipient() { this.setData({ showRecipient: false }) },
  onAddAddress() { this.openRecipient() },
  onRecName(e) { this.setData({ recipientForm: { ...this.data.recipientForm, nickname: e.detail.value } }) },
  onRecPhone(e) { this.setData({ recipientForm: { ...this.data.recipientForm, phone: e.detail.value } }) },
  onRecAddr(e) { this.setData({ recipientForm: { ...this.data.recipientForm, address: e.detail.value } }) },
  async saveRecipient() {
    const { nickname, phone, address } = this.data.recipientForm
    if (!nickname || !phone || !address) { wx.showToast({ title: '请填写完整信息', icon: 'none' }); return }
    try {
      const ccgapi = require('../../api/ccgapi')
      await ccgapi.recipientAdd({ nickname, phone, address })
      this.setData({ recipient: { name: nickname, phone, address }, showRecipient: false })
      this.fetchRecipients()
      wx.showToast({ title: '已保存', icon: 'none' })
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },
  async fetchRecipients(preferId) {
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
      const selId = chosen ? chosen.id : null
      const curIndex = selId ? list.findIndex(r => r.id === selId) : 0
      this.setData({ recipients: list, selectedRecId: selId, selectedRecipient: chosen || null, recCurrent: curIndex >= 0 ? curIndex : 0 })
    } catch (e) {
      wx.showToast({ title: '收礼人列表获取失败'+e.message, icon: 'none' })
    }
  },
  onRecSwiperChange(e) {
    const idx = e.detail && typeof e.detail.current === 'number' ? e.detail.current : 0
    const list = this.data.recipients || []
    const item = list[idx]
    if (item) {
      this.setData({ recCurrent: idx, selectedRecId: item.id, selectedRecipient: item })
    }
  },
  onEditRecipient(e) {
    const id = String(e.currentTarget.dataset.id)
    const rec = (this.data.recipients || []).find(r => r.id === id)
    if (rec) {
      this.setData({
        showEditRecipient: true,
        editRecipientForm: {
          recipient_id: id,
          nickname: rec.name || '',
          phone: rec.phone || '',
          address: rec.address || '',
          is_default: rec.is_default ? 1 : 0,
        }
      })
    }
  },
  closeEditRecipient() { this.setData({ showEditRecipient: false }) },
  onEditName(e) { this.setData({ editRecipientForm: { ...this.data.editRecipientForm, nickname: e.detail.value } }) },
  onEditPhone(e) { this.setData({ editRecipientForm: { ...this.data.editRecipientForm, phone: e.detail.value } }) },
  onEditAddr(e) { this.setData({ editRecipientForm: { ...this.data.editRecipientForm, address: e.detail.value } }) },
  onEditDefaultToggle(e) { this.setData({ editRecipientForm: { ...this.data.editRecipientForm, is_default: e.detail.value ? 1 : 0 } }) },
  async saveEditRecipient() {
    const { recipient_id, nickname, phone, address, is_default } = this.data.editRecipientForm
    if (!recipient_id || !nickname || !phone || !address) { wx.showToast({ title: '请填写完整信息', icon: 'none' }); return }
    try {
      const ccgapi = require('../../api/ccgapi')
      await ccgapi.recipientEdit({ recipient_id: Number(recipient_id), nickname, phone, address, is_default: Number(is_default) })
      this.setData({ showEditRecipient: false })
      this.fetchRecipients(String(recipient_id))
      wx.showToast({ title: '已更新', icon: 'none' })
    } catch (e) {
      wx.showToast({ title: '更新失败：'+e.message, icon: 'none' })
    }
  },
  async onDeleteRecipient(e) {
    const id = String(e.currentTarget.dataset.id)
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
            this.fetchRecipients()
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },
  selectRecipient(e) {
    const id = String(e.currentTarget.dataset.id)
    const list = this.data.recipients
    const recIndex = list.findIndex(r => r.id === id)
    const rec = recIndex >= 0 ? list[recIndex] : null
    this.setData({ selectedRecId: id, selectedRecipient: rec || null, recCurrent: recIndex >= 0 ? recIndex : this.data.recCurrent })
  },
  async onFinalize() {
    try {
      const ccgapi = require('../../api/ccgapi')
      const product_id = Number(this.data.product_id) || 0
      const quantity = Number(this.data.qty) || 1
      const recipient_id = Number(this.data.selectedRecId)
      if (!product_id || !recipient_id) {
        wx.showToast({ title: '请先选择收礼人', icon: 'none' })
        return
      }
      wx.showLoading({ title: '处理中…', mask: true })
      const newResp = await ccgapi.orderNew({ product_id, quantity, recipient_id })
      const order_id = Number(newResp.order_id) || 0
      if (!order_id) {
        wx.hideLoading()
        wx.showToast({ title: '创建订单失败', icon: 'none' })
        return
      }
      const prepay = await ccgapi.paymentPrepay({ order_id })
      console.log('[paymentPrepay]', prepay)
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
          this.setData({ showCheckout: false })
        },
        fail: (err) => {
          const msg = (err && err.errMsg) || '支付失败'
          wx.showToast({ title: msg, icon: 'none' })
        }
      })
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: '支付预下单失败', icon: 'none' })
    }
  }
})
