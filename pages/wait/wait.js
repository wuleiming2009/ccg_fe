Page({
  data: {},
  onLoad() {
    setTimeout(() => {
      wx.redirectTo({ url: '/pages/result/result' })
    }, 1500)
  }
})
