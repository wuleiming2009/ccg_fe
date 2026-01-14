Page({
  data: {},
  onLoad() {},
  onChangeGift() {
    wx.showToast({ title: '再换一个礼赠', icon: 'none' })
  },
  onRestart() {
    wx.redirectTo({ url: '/pages/chat/chat?reset=1' })
  },
  onBuy() {
    wx.showToast({ title: '前往购买', icon: 'none' })
  }
})
