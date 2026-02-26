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
    recipientRawText: '',
    recipient: { name: '', phone: '', address: '' },
    recipients: [],
    selectedRecId: null,
    selectedRecipient: null,
    recCurrent: 0,
    showEditRecipient: false,
    editRecipientForm: { recipient_id: '', nickname: '', phone: '', address: '', is_default: 0 },
    showInviteConfirm: false,
    inviteEditing: false,
    inviteSenderName: '',
    inviteConfirmed: false,
    pendingOrderInfo: null,
    showUserInfoAsk: false,
    askUserName: '',
    askPhone: '',
    askWxPhone: '',
  },
  onLoad(options) {
    let ec = null
    if (typeof this.getOpenerEventChannel === 'function') {
      try { ec = this.getOpenerEventChannel() } catch (e) { ec = null }
    }
    if (ec && typeof ec.on === 'function') {
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
    const cfg = wx.getStorageSync('userConfig') || {}
    const nm = cfg && (cfg.user_name || '')
    this.setData({ inviteSenderName: nm })
    const pid = Number(options && (options.pid || options.product_id)) || 0
    if (pid) {
      const ccgapi = require('../../api/ccgapi')
      ccgapi.productInfo({ product_id: pid }).then((infoResp) => {
        const it = infoResp.info || {}
        const format = (t, sep) => {
          if (!t) return ''
          return String(t).split(',').map(s => s.trim()).filter(Boolean).join(sep)
        }
        this.setData({
          product_id: it.product_id || pid,
          img_url: it.img_url,
          name: it.name,
          price: it.price,
          slogan: it.slogan || '',
          contents: it.contents || '',
          scene: it.scene || '',
          keywords: it.keywords || '',
          contents_fmt: format(it.contents, ' | '),
          scene_fmt: format(it.scene, ' · '),
          keywords_fmt: format(it.keywords, ' · '),
          match_text: it.match_text,
          match_meaning: it.match_meaning,
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
  onRecRawInput(e) { this.setData({ recipientRawText: e.detail.value }) },
  onRecPasteRecognize() {
    const setData = (nickname, phone, address) => this.setData({ recipientForm: { nickname, phone, address } })
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
  onRecChooseAddress() {
    if (!wx.chooseAddress) { wx.showToast({ title: '当前版本不支持地址簿', icon: 'none' }); return }
    wx.chooseAddress({
      success: (res) => {
        const nickname = res.userName || ''
        const phone = res.telNumber || ''
        const full = `${res.provinceName || ''}${res.cityName || ''}${res.countyName || ''}${res.detailInfo || ''}`
        this.setData({ recipientForm: { nickname, phone, address: full } })
      },
      fail: () => wx.showToast({ title: '打开地址簿失败', icon: 'none' })
    })
  },
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
      const selId = chosen ? chosen.id : 'invite'
      const curIndex = selId === 'invite' ? 0 : (list.findIndex(r => r.id === selId) + 1)
      this.setData({ recipients: list, selectedRecId: selId, selectedRecipient: chosen || null, recCurrent: curIndex >= 0 ? curIndex : 0 })
    } catch (e) {
      wx.showToast({ title: '收礼人列表获取失败'+e.message, icon: 'none' })
    }
  },
  onRecSwiperChange(e) {
    const idx = e.detail && typeof e.detail.current === 'number' ? e.detail.current : 0
    const list = this.data.recipients || []
    if (idx === 0) {
      this.setData({ recCurrent: 0, selectedRecId: 'invite', selectedRecipient: null })
      return
    }
    const realIdx = idx - 1
    const item = list[realIdx]
    if (item) {
      this.setData({ recCurrent: idx, selectedRecId: item.id, selectedRecipient: item })
    }
  },
  selectRecipient(e) {
    const id = String(e.currentTarget.dataset.id)
    const list = this.data.recipients || []
    if (id === 'invite') {
      this.setData({ selectedRecId: 'invite', selectedRecipient: null, recCurrent: 0 })
      return
    }
    const recIndex = list.findIndex(r => r.id === id)
    const rec = recIndex >= 0 ? list[recIndex] : null
    const cur = recIndex >= 0 ? (recIndex + 1) : this.data.recCurrent
    this.setData({ selectedRecId: id, selectedRecipient: rec || null, recCurrent: cur })
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
  onShow() { wx.showShareMenu({ withShareTicket: true }) },
  onShareAppMessage() {
    const pid = Number(this.data.product_id) || 0
    const path = pid ? (`/pages/product/product?pid=${pid}`) : '/pages/market/market'
    return { title: 'CC GIFT 礼物详情', path }
  },
  async onFinalize() {
    try {
      const ccgapi = require('../../api/ccgapi')
      if (!this._skipInfoCheckOnce) {
        const uc = wx.getStorageSync('userConfig') || {}
        const nm = String(uc.user_name || '').trim()
        const ph = String(uc.phone || '').trim()
        const wxph = String(uc.wx_phone || '').trim()
        if (!nm || !ph) {
          this.setData({ showUserInfoAsk: true, askUserName: nm, askPhone: ph, askWxPhone: wxph })
          return
        }
      } else {
        this._skipInfoCheckOnce = false
      }
      const product_id = Number(this.data.product_id) || 0
      const quantity = Number(this.data.qty) || 1
      const isInvite = String(this.data.selectedRecId) === 'invite'
      const recipient_id = isInvite ? 999 : Number(this.data.selectedRecId)
      if (!product_id) { wx.showToast({ title: '商品无效', icon: 'none' }); return }
      if (!isInvite && !recipient_id) { wx.showToast({ title: '请先选择收礼人', icon: 'none' }); return }
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
        success: async () => {
          try {
            const env = require('../../config/env')
            const TEMPLATE_ID = env && env.orderMsgTemplateId
            if (TEMPLATE_ID) {
              wx.requestSubscribeMessage({ tmplIds: [TEMPLATE_ID], success: (r) => { console.log('subscribe ok', r) }, fail: (e) => { console.error('subscribe fail', e) } })
            }
          } catch (e) { console.error('subscribe request error', e) }
          try {
            const info = await ccgapi.orderInfo({ order_id })
            this.setData({ showCheckout: false })
            if (isInvite) {
              this.setData({ showInviteConfirm: true, inviteConfirmed: false, pendingOrderInfo: info })
              return
            }
            wx.navigateTo({
              url: '/pages/order/order',
              success: (res) => {
                res.eventChannel && res.eventChannel.emit('order', info)
              }
            })
          } catch (e) {
            wx.showToast({ title: '支付成功，获取订单失败', icon: 'none' })
          }
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
  ,onInviteToggleEdit() { this.setData({ inviteEditing: !this.data.inviteEditing }) }
  ,onInviteNameInput(e) { this.setData({ inviteSenderName: e.detail.value }) }
  ,onInviteCancel() { this.setData({ showInviteConfirm: false, inviteEditing: false, pendingOrderInfo: null }) }
  ,onInviteConfirm() {
    const info = this.data.pendingOrderInfo
    const name = String(this.data.inviteSenderName || '').trim()
    this.setData({ inviteConfirmed: true, showInviteConfirm: false, inviteEditing: false, pendingOrderInfo: null })
    const ccgapi = require('../../api/ccgapi')
    if (info && info.order_id) {
      ccgapi.setSendName({ order_id: Number(info.order_id), send_user_name: name || undefined }).catch(() => {})
    }
    if (info) {
      wx.navigateTo({
        url: '/pages/order/order',
        success: (res) => {
          res.eventChannel && res.eventChannel.emit('order', info)
        }
      })
    }
  }
  ,onInviteIdentity() {
    try {
      const uc = wx.getStorageSync('userConfig') || {}
      const nm = uc && uc.user_name || ''
      this.setData({ inviteSenderName: nm, showInviteConfirm: true, inviteEditing: true })
    } catch (_) {
      this.setData({ showInviteConfirm: true, inviteEditing: true })
    }
  }
  ,onAskNameInput(e) { this.setData({ askUserName: e.detail.value }) }
  ,onAskPhoneInput(e) { this.setData({ askPhone: e.detail.value }) }
  ,onAskCancel() { this.setData({ showUserInfoAsk: false }) }
  ,onAskWxNameAuth() { wx.showToast({ title: '请手动填写称呼', icon: 'none' }) }
  ,onAskGetPhone(e) {
    try {
      console.log('ask.getPhoneNumber detail', e && e.detail)
      const d = e && e.detail || {}
      const plain = d.phoneNumber || d.purePhoneNumber || ''
      const code = d.code || ''
      const ccgapi = require('../../api/ccgapi')
      if (plain) { console.log('ask.wx_phone', plain); this.setData({ askPhone: plain, askWxPhone: plain }); return }
      if (code) {
        console.log('ask.wx_phone_code', code)
        ccgapi.decodePhone({ code }).then((r) => { console.log('ask.decodePhone result', r); const p = r && r.phone || ''; if (p) this.setData({ askPhone: p, askWxPhone: p }) })
      }
    } catch (_) {}
  }
  ,async onAskConfirm() {
    const name = String(this.data.askUserName || '').trim()
    const phone = String(this.data.askWxPhone || '').trim()
    if (!name) { wx.showToast({ title: '请填写称呼', icon: 'none' }); return }
    try {
      const ccgapi = require('../../api/ccgapi')
      await ccgapi.setInfo({ user_name: name || undefined, wx_nickname: name || undefined, phone: phone || undefined, wx_phone: phone || undefined })
      const cur = wx.getStorageSync('userConfig') || {}
      if (name) cur.user_name = name
      if (phone) cur.phone = phone
      if (phone) cur.wx_phone = phone
      wx.setStorageSync('userConfig', cur)
    } catch (e) {
      // 忽略错误，继续下单
    }
    this.setData({ showUserInfoAsk: false })
    this._skipInfoCheckOnce = true
    this.onFinalize()
  }
})
