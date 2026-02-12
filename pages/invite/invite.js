const env = require('../../config/env')

Page({
  data: { order_id: 0, name: '', phone: '', address: '', rawText: '', completed: false },
  async onLoad(query) {
    const oid = Number((query && query.order_id) || 0)
    this.setData({ order_id: oid })
    try {
      const ccgapi = require('../../api/ccgapi')
      const status = await ccgapi.getOrderStatus({ order_id: oid })
      const isDone = Number(status.recipient_id || 0) !== 999 && Number(status.recipient_id || 0) > 0
      this.setData({ completed: !!isDone })
    } catch (e) {
      this.setData({ completed: false })
    }
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
  async onSubmit() {
    const { order_id, name, phone, address } = this.data
    if (!name || !phone || !address) { wx.showToast({ title: '请填写完整信息', icon: 'none' }); return }
    try {
      const ccgapi = require('../../api/ccgapi')
      await ccgapi.setOrderRecipient({ order_id, nickname: name, phone, address })
      const showModal = () => wx.showModal({
        title: '地址填写成功',
        content: '等待礼物的到来吧～',
        showCancel: false,
        confirmText: '去聊天',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/chat/chat' })
          }
        },
        fail: (err) => {
          console.log('showModal fail', err)
          wx.showToast({ title: '地址填写成功', icon: 'none' })
        }
      })
      setTimeout(showModal, 50)
    } catch (e) {
      wx.showToast({ title: '提交失败', icon: 'none' })
    }
  }
  ,onPasteRecognize() {
    const setData = (name, phone, address) => this.setData({ name, phone, address })
    const tryParse = (txt) => {
      // 手机号：支持+86前缀、空格或连字符
      const phoneMatch = txt.match(/(?:\+?86[-\s]?)?(1[3-9]\d{9})/)
      const phone = phoneMatch ? phoneMatch[1] : ''
      const removedPhone = phoneMatch ? phoneMatch[0] : ''
      let cleaned = txt.replace(removedPhone, ' ').replace(/[，,;；]/g, ' ').replace(/\s+/g, ' ').trim()

      // 先尝试 honor 称呼
      const honorMatch = cleaned.match(/(.{1,8}?(先生|女士|小姐|同学|老师))/)
      let name = ''
      let address = ''
      if (honorMatch) {
        name = honorMatch[1].trim()
        address = cleaned.replace(honorMatch[1], '').trim()
      } else {
        const tokens = cleaned.split(' ')
        const first = tokens[0] || ''
        // 如果首段看起来是地址关键词，则不识别姓名
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
  }
  ,onGoChat() { wx.switchTab({ url: '/pages/chat/chat' }) }
})
