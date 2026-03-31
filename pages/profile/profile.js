const ccgapi = require('../../api/ccgapi')
const COS_FRONTEND = { enabled: true, bucket: 'wumuxuan-1253516064', region: 'ap-shanghai', keyPrefix: 'ccg/user_avatar/' }

Page({
  data: {
    user_name: '',
    gender: 0,
    birthday: '',
    city: '',
    phone: '',
    signature: '',
    avatar: '',
    prevAvatar: '',
    hasPendingAvatarChange: false,
    uploadingAvatar: false,
    defaultAvatar: 'https://wumuxuan-1253516064.cos.ap-shanghai.myqcloud.com/ccg/uni-app/default_head_img.png',
    region: [],
    regionText: ''
  },
  onLoad() {
    this.fetch()
  },
  async fetch() {
    try {
      const resp = await ccgapi.userInfo({})
      const name = resp.user_name || ''
      const phone = resp.phone || resp.wx_phone || ''
      this.setData({
        user_name: name,
        gender: (typeof resp.gender === 'number' ? resp.gender : (Number(resp.gender) || 0)),
        birthday: resp.birthday || '',
        city: resp.city || '',
        phone,
        signature: resp.signature || '',
        avatar: resp.avatar || ''
      })
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },
  onNameInput(e) { this.setData({ user_name: e.detail.value }) },
  onPhoneInput(e) {
    const v = String(e.detail.value || '').replace(/\D/g, '').slice(0, 13)
    this.setData({ phone: v })
  },
  onCityInput(e) { this.setData({ city: e.detail.value }) },
  onSignatureInput(e) { this.setData({ signature: e.detail.value }) },
  onChooseGender(e) {
    const g = Number(e.currentTarget.dataset.g)
    this.setData({ gender: isNaN(g) ? 0 : g })
  },
  onBirthdayChange(e) { this.setData({ birthday: e.detail.value }) },
  onRegionChange(e) {
    const arr = e.detail.value || []
    const city = Array.isArray(arr) && arr.length ? (arr[1] || arr[0] || '') : ''
    this.setData({ region: arr, regionText: city, city })
  },
  onChooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const path = (res.tempFilePaths && res.tempFilePaths[0]) || ''
        if (!path) return
        this.setData({ prevAvatar: this.data.avatar || '', avatar: path, hasPendingAvatarChange: true })
        const ext = (path.split('.').pop() || 'jpg').toLowerCase()
        const name = 'avatar_' + Date.now() + '.' + ext
        const ct = this.guessCT(ext)
        if (COS_FRONTEND.enabled && COS_FRONTEND.bucket && COS_FRONTEND.region) {
          this.putCosWithSign(path, ext, name, ct)
          return
        }
        this.putViaPolicy(path, name, ct)
      }
    })
  },
  putViaPolicy(path, name, ct) {
    this.setData({ uploadingAvatar: true })
    const p = ccgapi.cosPostPolicy({ file_name: name, content_type: ct }).then((pol) => {
      if (!pol || !pol.url) return
      const task = wx.uploadFile({
        url: pol.url,
        filePath: path,
        name: 'file',
        formData: pol.form || {},
        success: () => {
          const url = pol.resource_url || (pol.url.replace(/\/$/, '') + '/' + ((pol.form && pol.form.key) || pol.key || name))
          this.setData({ avatar: url, uploadingAvatar: false })
          wx.showToast({ title: '头像已上传，记得保存', icon: 'none' })
        },
        fail: () => {
          this.setData({ uploadingAvatar: false })
          wx.showToast({ title: '上传失败', icon: 'none' })
        }
      })
      this.avatarUploadTask = task
    }).catch(() => { this.setData({ uploadingAvatar: false }) })
    return p
  },
  putCosWithSign(path, ext, name, ct) {
    const key = (COS_FRONTEND.keyPrefix || '') + name
    const baseUrl = 'https://' + COS_FRONTEND.bucket + '.cos.' + COS_FRONTEND.region + '.myqcloud.com/' + key
    this.setData({ uploadingAvatar: true })
    const p = ccgapi.userCosPutSign({ path: key }).then((r) => {
      const sign = r && r.sign
      if (!sign) { wx.showToast({ title: '签名失败', icon: 'none' }); return }
      const fs = wx.getFileSystemManager()
      fs.readFile({
        filePath: path,
        success: (dataRes) => {
          const s = String(sign || '').replace(/^[\s`'"]+|[\s`'"]+$/g, '')
          const isUrlSign = /^https?:\/\//i.test(s)
          const useUrl = isUrlSign ? s : baseUrl
          const headers = isUrlSign ? {} : { 'Content-Type': ct, 'Authorization': s }
          const req = wx.request({
            url: useUrl,
            method: 'PUT',
            data: dataRes.data,
            header: headers,
            success: (res) => {
              const ok = !res || typeof res.statusCode !== 'number' || (res.statusCode >= 200 && res.statusCode < 300)
              const finalUrl = isUrlSign ? s.split('?')[0] : baseUrl
              if (ok) {
                this.setData({ avatar: finalUrl, uploadingAvatar: false })
              } else {
                this.setData({ uploadingAvatar: false })
              }
              wx.showToast({ title: '头像已上传，记得保存', icon: 'none' })
            },
            fail: () => {
              this.setData({ uploadingAvatar: false })
              wx.showToast({ title: '上传失败', icon: 'none' })
            }
          })
          this.avatarUploadTask = req
        },
        fail: () => { this.setData({ uploadingAvatar: false }); wx.showToast({ title: '读取文件失败', icon: 'none' }) }
      })
    }).catch(() => { this.setData({ uploadingAvatar: false }); wx.showToast({ title: '签名失败', icon: 'none' }) })
    return p
  },
  putCosPublic(path, ext, name) {
    const key = (COS_FRONTEND.keyPrefix || '') + name
    const url = 'https://' + COS_FRONTEND.bucket + '.cos.' + COS_FRONTEND.region + '.myqcloud.com/' + key
    const ct = this.guessCT(ext)
    const fs = wx.getFileSystemManager()
    fs.readFile({
      filePath: path,
      success: (r) => {
        const req = wx.request({
          url,
          method: 'PUT',
          data: r.data,
          header: { 'Content-Type': ct },
          success: () => {
            this.setData({ avatar: url })
            wx.showToast({ title: '头像已上传，记得保存', icon: 'none' })
          },
          fail: () => {
            wx.showToast({ title: '上传失败', icon: 'none' })
          }
        })
        this.avatarUploadTask = req
      },
      fail: () => {
        wx.showToast({ title: '读取文件失败', icon: 'none' })
      }
    })
  },
  onCancelAvatar(e) {
    if (this.avatarUploadTask && typeof this.avatarUploadTask.abort === 'function' && this.data.uploadingAvatar) {
      try { this.avatarUploadTask.abort() } catch (_) {}
    }
    const prev = this.data.prevAvatar || ''
    this.setData({ avatar: prev, hasPendingAvatarChange: false, prevAvatar: '', uploadingAvatar: false })
    wx.showToast({ title: '已撤销更换', icon: 'none' })
  },
  guessCT(ext) {
    const m = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif'
    }
    return m[ext] || 'application/octet-stream'
  },
  async onSave() {
    const payload = {
      user_name: String(this.data.user_name || '').trim(),
      avatar: String(this.data.avatar || '').trim(),
      gender: Number(this.data.gender) || 0,
      birthday: String(this.data.birthday || '').trim(),
      city: String(this.data.city || '').trim(),
      signature: String(this.data.signature || '').trim(),
      phone: String(this.data.phone || '').trim(),
      wx_phone: String(this.data.phone || '').trim()
    }
    try {
      await ccgapi.setInfo(payload)
      wx.showToast({ title: '已保存', icon: 'none' })
      setTimeout(() => { wx.navigateBack({ delta: 1 }) }, 300)
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  }
})
