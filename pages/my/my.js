Page({
  data: { name: '', greeting: '', welcomStr: '', showNameEdit: false, initial: '小', showContact: false, contactQrUrl: 'https://wumuxuan-1253516064.cos.ap-shanghai.myqcloud.com/ccg/uni-app/r_wechat_qrcode.jpg' },
  onLoad() {
    const cfg = wx.getStorageSync('userConfig') || {}
    const nm = cfg.user_name || ''
    this.setData({ name: nm, initial: this.getInitial(nm) })
    // 尝试从服务端获取
    const ccgapi = require('../../api/ccgapi')
    ccgapi.userInfo({}).then((resp) => {
      const name = resp.user_name || nm
      this.setData({ name, initial: this.getInitial(name) })
      const cur = wx.getStorageSync('userConfig') || {}
      cur.user_name = name
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
    const cfg = wx.getStorageSync('userConfig') || {}
    cfg.user_name = t
    wx.setStorageSync('userConfig', cfg)
    const ccgapi = require('../../api/ccgapi')
    ccgapi.setInfo({ user_name: t }).then(() => {
      wx.showToast({ title: '已保存', icon: 'none' })
      this.setData({ showNameEdit: false })
    }).catch(() => {
      wx.showToast({ title: '本地已保存', icon: 'none' })
      this.setData({ showNameEdit: false })
    })
  },
  onOpenArchive() {
    wx.navigateTo({ url: '/pages/archive/archive' })
  },
  onContact() { this.setData({ showContact: true }) },
  onCloseContact() { this.setData({ showContact: false }) }
})
