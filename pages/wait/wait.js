const ccgapi = require('../../api/ccgapi')

Page({
  data: { failed: false },
  onLoad() {
    const ec = this.getOpenerEventChannel && this.getOpenerEventChannel()
    if (ec) {
      ec.on('matchPayload', async (payload) => {
        try {
          const resp = await ccgapi.match({ messages: payload.messages || '', match_id: Number(payload.match_id) || 0 })
          wx.navigateTo({
            url: '/pages/result/result',
            success: (res) => {
              if (res.eventChannel) {
                res.eventChannel.emit('matchResult', resp)
                res.eventChannel.emit('matchMessages', payload.messages || '')
                res.eventChannel.emit('matchId', resp.match_id || 0)
              }
            }
          })
        } catch (e) {
          this.setData({ failed: true })
          wx.showToast({ title: '匹配失败', icon: 'none' })
          setTimeout(() => wx.redirectTo({ url: '/pages/chat/chat' }), 1200)
        }
      })
    }
  }
})
