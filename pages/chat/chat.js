Page({
  data: {
    greeting: '',
    welcomStr: ''
  },
  onLoad() {
    console.log('聊天页面加载完成')
  },
  onShow() {
    this.setData({ greeting: this.getGreeting() })

    const ccgapi = require('../../api/ccgapi');
    ccgapi.welcomeString({}).then((resp) => {
      this.setData({ welcomStr: resp.str })
    })
  },
  getGreeting() {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return '早上好 ✨'
    if (hour >= 12 && hour < 18) return '下午好 ✨'
    return '晚上好 ✨'
  },
  onMatch() {
    console.log('开启礼物匹配')
  },
  onMyGifts() {
    console.log('查看我的礼赠')
  },
  onGiftHistory() {
    console.log('查看礼赠历史')
  },
  onSend() {
    console.log('发送（示意）')
  }
})
