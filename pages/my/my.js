Page({
  data: { name: '', phone: '', wx_nickname: '', showWxAuth: false, greeting: '', welcomStr: '', showNameEdit: false, initial: '小', showContact: false, contactQrUrl: 'https://wumuxuan-1253516064.cos.ap-shanghai.myqcloud.com/ccg/uni-app/r_wechat_qrcode.jpg' },
  onLoad() {
    const cfg = wx.getStorageSync('userConfig') || {}
    const nm = cfg.user_name || ''
    this.setData({ name: nm, initial: this.getInitial(nm) })
    // 尝试从服务端获取
    const ccgapi = require('../../api/ccgapi')
    ccgapi.userInfo({}).then((resp) => {
      const name = resp.user_name || nm
      const nick = resp.wx_nickname || ''
      const wxPhone = resp.wx_phone || ''
      const phone = resp.phone || wxPhone || ''
      this.setData({ name, phone, wx_nickname: nick, showWxAuth: !(wxPhone && String(wxPhone).trim()), initial: this.getInitial(name) })
      const cur = wx.getStorageSync('userConfig') || {}
      cur.user_name = name
      cur.wx_nickname = nick
      cur.phone = phone
      cur.wx_phone = wxPhone
      wx.setStorageSync('userConfig', cur)
    }).catch(() => {})
  },
  onShow() {
    const name = (this.data.name || '').trim()
    const prefix = name ? `Hi，${name} ` : 'Hi，'
    this.setData({ greeting: prefix + this.getGreeting() })
    const ccgapi = require('../../api/ccgapi');
    ccgapi.welcomeString({}).then((resp) => {
      this.setData({ welcomStr: resp.str })
    })
  },
  getGreeting() {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return '上午好'
    if (hour >= 12 && hour < 18) return '下午好'
    return '晚上好'
  },
  getInitial(n) {
    const t = String(n || '').trim()
    return t ? t[0] : '小'
  },
  onNameInput(e) {
    const v = e.detail.value
    this.setData({ name: v, initial: this.getInitial(v) })
  },
  onEditName() { this.setData({ showNameEdit: true }) },
  onCloseModal() { this.setData({ showNameEdit: false }) },
  onSaveName() {
    const t = (this.data.name || '').trim()
    if (!t) { wx.showToast({ title: '请输入昵称', icon: 'none' }); return }
    const cfg = wx.getStorageSync('userConfig') || {}
    cfg.user_name = t
    wx.setStorageSync('userConfig', cfg)
    const ccgapi = require('../../api/ccgapi')
    ccgapi.setInfo({ user_name: t, wx_nickname: this.data.wx_nickname }).then(() => {
      wx.showToast({ title: '已保存', icon: 'none' })
      this.setData({ showNameEdit: false })
    }).catch(() => {
      wx.showToast({ title: '本地已保存', icon: 'none' })
      this.setData({ showNameEdit: false })
    })
  },
  onWxAuth() {
    this.setData({ showNameEdit: true })
    wx.showToast({ title: '请手动填写昵称', icon: 'none' })
  },
  onGetPhone(e) {
    try {
      console.log('onGetPhone detail', e && e.detail)
      const d = e && e.detail || {}
      const plainPhone = d.phoneNumber || d.purePhoneNumber || ''
      const code = d.code || ''
      if (plainPhone) {
        console.log('wx_phone', plainPhone)
        this.setData({ phone: plainPhone, showWxAuth: false })
        const ccgapi = require('../../api/ccgapi')
        const currentName = String(this.data.name || '').trim()
        const payload = { wx_phone: plainPhone, phone: plainPhone, user_name: currentName || this.data.wx_nickname, wx_nickname: this.data.wx_nickname }
        ccgapi.setInfo(payload).then(() => {
          const cur = wx.getStorageSync('userConfig') || {}
          cur.phone = plainPhone
          cur.wx_phone = plainPhone
          if (!currentName && this.data.wx_nickname) cur.user_name = this.data.wx_nickname
          wx.setStorageSync('userConfig', cur)
          wx.showToast({ title: '已获取手机号', icon: 'none' })
        }).catch(() => {
          wx.showToast({ title: '已获取手机号', icon: 'none' })
        })
      } else if (code) {
        console.log('wx_phone_code', code)
        const ccgapi = require('../../api/ccgapi')
        ccgapi.decodePhone({ code }).then((r) => {
          console.log('decodePhone result', r)
          const phone = r && r.phone || ''
          if (phone) {
            this.setData({ phone })
            const currentName = String(this.data.name || '').trim()
            const payload = { wx_phone: phone, phone, user_name: currentName || this.data.wx_nickname, wx_nickname: this.data.wx_nickname }
            return ccgapi.setInfo(payload)
          } else {
            wx.showToast({ title: '未解码到手机号', icon: 'none' })
          }
        }).then(() => {
          const cur = wx.getStorageSync('userConfig') || {}
          cur.phone = this.data.phone || cur.phone || ''
          if (this.data.phone) cur.wx_phone = this.data.phone
          if (!cur.user_name && this.data.wx_nickname) cur.user_name = this.data.wx_nickname
          wx.setStorageSync('userConfig', cur)
          this.setData({ showWxAuth: false })
          wx.showToast({ title: '已获取手机号', icon: 'none' })
        }).catch(() => {
          wx.showToast({ title: '提交失败', icon: 'none' })
        })
      } else {
        wx.showToast({ title: '未获取到手机号', icon: 'none' })
      }
    } catch (err) {
      console.error('onGetPhone error', err)
    }
  },
  onOpenArchive() {
    wx.navigateTo({ url: '/pages/archive/archive' })
  },
  onOpenReceived() {
    wx.navigateTo({ url: '/pages/received/received' })
  },
  onContact() { this.setData({ showContact: true }) },
  onCloseContact() { this.setData({ showContact: false }) }
})
