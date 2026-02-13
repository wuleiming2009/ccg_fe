Page({
  data: {
    greeting: '',
    welcomStr: '愿你被生活温柔以待',
    messages: [
      { role: 'assistant', content: '嗨～最近过得怎么样？有没有发生什么有趣的事，或是想聊聊、需要我一起琢磨的？' }
    ],
    inputValue: '',
    scrollInto: '',
    showMyGifts: true,
    showGiftHistory: true,
    hasPills: true,
    voiceMode: false,
    recording: false,
    voiceHint: '按住说话',
    introMode: true,
    introAnim: {},
    userName: '',
    introPlaceholder: '',
    prodCurrent: 0,
    selectedProductIndex: 0
  },
  onShow() {
    wx.showShareMenu({ withShareTicket: true })
  },
  onShareAppMessage() {
    return { title: 'CC GIFT 礼赠顾问', path: '/pages/chat/chat' }
  },
  onLoad(options) {
    const app = getApp()
    this.client = app && app.globalData && app.globalData.aiClient
    const cfg = wx.getStorageSync('userConfig') || {}
    this.setData({ hasPills: true })
    this.setData({ userName: cfg.user_name || '' })
    if (options && options.reset === '1') {
      this.setData({ messages: [ { role: 'assistant', content: '嗨～最近过得怎么样？有没有发生什么有趣的事，或是想聊聊、需要我一起琢磨的？' } ], inputValue: '', scrollInto: 'end-anchor' })
      this.validAnswerCount = 0
      this.matchStarted = false
      this.setData({ introMode: true, introAnim: {} })
    }
    const { questions, PERSONA_PROMPT } = require('../../config/chatbot')
    const qs = Array.isArray(cfg.questions) && cfg.questions.length ? cfg.questions : questions
    this.questions = qs
    this.qThreshold = Math.ceil((qs.length || 0) * 0.8)
    const qList = qs.map((q, i) => `${i + 1}. ${q}`).join('；')
    this.personaPrompt = `${PERSONA_PROMPT} 请以自然中文表达，不要输出括号或其他标记的语气/动作词，如（关切的）（轻声的）。逐步询问以下问题，至少覆盖80%，每次只问1-2个并结合上下文：${qList}。请始终以朋友口吻聊天，不要在聊天中提供任何商品或礼物建议，也不要直白说明“送礼”的需求或推荐流程。每次回复末尾追加<meta>{"valid_answer":(true|false),"valid_answer_count":整数,"cta_hint":(true|false)}</meta>，用于内部评估上一条用户回答是否为正常且有用的答案、已收集的有效答案数量，以及你认为是否可以在此时轻轻提醒开启匹配。不要让用户看到<meta>，仅在文本最后插入该标签。`
    this.validAnswerCount = 0
    this.matchStarted = false
    this.autoMatchTriggered = false
    this.setData({ scrollInto: 'end-anchor' })
    this.initVoice()
    const placeholders = ['有什么困惑问我吗？', '有问题，尽管问。']
    const ph = placeholders[Math.floor(Math.random() * placeholders.length)]
    this.setData({ introPlaceholder: ph })
  },
  onShow() {
    const name = (this.data.userName || '').trim()
    const prefix = name ? `Hi，${name} ` : 'Hi，'
    this.setData({ greeting: prefix + this.getGreeting() })
    const ccgapi = require('../../api/ccgapi');
    ccgapi.welcomeString({}).then((resp) => {
      this.setData({ welcomStr: resp.str })
    })
  },
  initVoice() {
    try {
      const plugin = requirePlugin('WechatSI')
      this.recManager = plugin.getRecordRecognitionManager && plugin.getRecordRecognitionManager()
      this.recManager.onRecognize = (res) => {
        const t = res.result || ''
        this.setData({ inputValue: t })
      }
      this.recManager.onStop = (res) => {
        const t = res.result || ''
        const text = (t || '').trim()
        this.setData({ recording: false, voiceHint: '按住说话', inputValue: text })
        if (text) {
          if (this.data.introMode) {
            this.onIntroSend()
          } else {
            this.onSend()
          }
        } else {
          wx.showToast({ title: '未识别到语音', icon: 'none' })
        }
      }
      this.recManager.onError = () => {
        this.setData({ recording: false, voiceHint: '按住说话' })
        wx.showToast({ title: '语音识别失败', icon: 'none' })
      }
    } catch (e) {}
  },
  async ensureRecordAuth() {
    try {
      const setting = await new Promise(resolve => wx.getSetting({ success: resolve, fail: () => resolve({ authSetting: {} }) }))
      if (!setting.authSetting || !setting.authSetting['scope.record']) {
        await new Promise((resolve, reject) => wx.authorize({ scope: 'scope.record', success: resolve, fail: reject }))
      }
    } catch (e) {
      wx.showModal({ title: '需要录音权限', content: '请在设置中允许麦克风权限以使用语音输入', success: (r) => { if (r.confirm) wx.openSetting({}) } })
      throw e
    }
  },
  onToggleVoiceMode() {
    const next = !this.data.voiceMode
    this.setData({ voiceMode: next })
  },
  async onVoiceStart() {
    if (!this.recManager) { wx.showToast({ title: '语音未就绪', icon: 'none' }); return }
    await this.ensureRecordAuth().catch(() => {})
    this.setData({ recording: true, voiceHint: '松开结束' })
    this.recManager.start({ lang: 'zh_CN' })
  },
  onVoiceEnd() {
    if (!this.recManager) return
    this.setData({ voiceHint: '按住说话' })
    this.recManager.stop()
  },
  onVoiceCancel() {
    if (!this.recManager) return
    this.setData({ recording: false, voiceHint: '按住说话' })
    this.recManager.stop()
  },
  getGreeting() {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return '上午好'
    if (hour >= 12 && hour < 18) return '下午好'
    return '晚上好'
  },
  onMatch() {
    console.log('开启礼物匹配')
  },
  onMyGifts() {
    console.log('查看我的礼赠')
  },
  onGiftHistory() {
    wx.navigateTo({ url: '/pages/history/history' })
  },
  
  onInput(e) {
    this.setData({ inputValue: e.detail.value })
  },
  onIntroInput(e) {
    this.setData({ inputValue: e.detail.value })
  },
  onIntroFocus() {
  },
  onIntroSend() {
    if (this.data.introMode) {
      const animation = wx.createAnimation({ duration: 220, timingFunction: 'ease-in-out' })
      animation.scale(1.03).opacity(0.0).step()
      this.setData({ introAnim: animation.export() })
      setTimeout(() => {
        this.setData({ introMode: false, introAnim: {} })
        this.onSend()
      }, 200)
      return
    }
    this.onSend()
  },
  onIntroVoice() {
    if (this.data.introMode) {
      const animation = wx.createAnimation({ duration: 220, timingFunction: 'ease-in-out' })
      animation.scale(1.03).opacity(0.0).step()
      this.setData({ introAnim: animation.export() })
      setTimeout(async () => {
        this.setData({ introMode: false, introAnim: {} })
        this.setData({ voiceMode: true })
        await this.ensureRecordAuth().catch(() => {})
        if (this.recManager) {
          this.setData({ recording: true, voiceHint: '松开结束' })
          this.recManager.start({ lang: 'zh_CN' })
        }
      }, 200)
      return
    }
    this.onToggleVoiceMode()
  },
  onQuickCapsule(e) {
    const t = e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.text
    const text = String(t || '').trim()
    if (!text) return
    this.setData({ inputValue: text })
    this.onIntroSend()
  },
  async onSend() {
    const text = (this.data.inputValue || '').trim()
    if (!text) return
    const msgs = this.data.messages.concat([{ role: 'user', content: text }])
    this.setData({ messages: msgs, inputValue: '', scrollInto: 'end-anchor' })
    const withTyping = this.data.messages.concat([{ role: 'assistant', content: '...', typing: true }])
    this.setData({ messages: withTyping, scrollInto: 'end-anchor' })
    try {
      if (!this.client) {
        wx.showToast({ title: 'AI未初始化', icon: 'none' })
        return
      }
      const resp = await this.client.chat({ messages: this.buildChatMessages(msgs) })
      const list = this.data.messages.slice()
      const typingIndex = list.length - 1
      const raw = resp.content || '（无回复）'
      const parsed = this.extractMeta(raw)
      list[typingIndex] = { role: 'assistant', content: this.sanitize(parsed.visible) }
      this.setData({ messages: list, scrollInto: 'end-anchor' })
      this.updateProgress(parsed.meta, text)
      this.logProgress(parsed.meta)
      this.updateCTAVisibility(parsed.meta)
    } catch (e) {
      wx.showToast({ title: '发送失败', icon: 'none' })
      console.error('chat send error', e)
    }
  },
  buildChatMessages(list) {
    const dialog = (Array.isArray(list) ? list : [])
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map(m => ({ role: m.role, content: m.content }))
    return [{ role: 'system', content: this.personaPrompt }].concat(dialog)
  },
  sanitize(text) {
    return String(text)
      .replace(/（[^）]{1,20}）/g, '')
      .replace(/\([^)]{1,20}\)/g, '')
      .replace(/<meta>[\s\S]*?<\/meta>/gi, '')
      .trim()
  },
  extractMeta(text) {
    const m = /<meta>([\s\S]*?)<\/meta>/i.exec(String(text))
    if (!m) return { visible: String(text), meta: null }
    let meta = null
    try {
      meta = JSON.parse(m[1])
    } catch (e) {
      meta = null
    }
    const visible = String(text).replace(m[0], '')
    return { visible, meta }
  },
  updateProgress(meta, lastUserText) {
    if (meta && typeof meta.valid_answer_count === 'number') {
      this.validAnswerCount = Math.max(0, meta.valid_answer_count)
      return
    }
    if (meta && meta.valid_answer === true) {
      this.validAnswerCount = (this.validAnswerCount || 0) + 1
      return
    }
    // Fallback: heuristic check
    if (this.isNormalAnswer(lastUserText)) {
      this.validAnswerCount = (this.validAnswerCount || 0) + 1
    }
  },
  isNormalAnswer(text) {
    const t = String(text || '').trim()
    if (!t) return false
    if (t.length < 3) return false
    const genericExact = [ '不知道', '不太清楚', '随便', '看你', '无', '没有', '不需要', '算了' ]
    if (genericExact.includes(t)) return false
    // Reject only emoji/punct
    if (/^[\p{P}\p{Z}\p{S}]+$/u.test(t)) return false
    return true
  },
  updateCTAVisibility(meta) {
    if (this.matchStarted) return
    const msgs = (this.data.messages || [])
    const anyCTA = msgs.some(m => m.type === 'cta')
    const lastIsCTA = msgs.length > 0 && msgs[msgs.length - 1].type === 'cta'
    const validCount = this.validAnswerCount || 0
    if (!anyCTA && validCount >= this.qThreshold) {
      console.log('auto-match check', { reason: 'threshold', validCount, qThreshold: this.qThreshold, matchStarted: !!this.matchStarted })
      this.autoMatchInChat()
      return
    }
    if (meta && meta.cta_hint === true && !lastIsCTA) {
      console.log('auto-match check', { reason: 'cta_hint', validCount, qThreshold: this.qThreshold, matchStarted: !!this.matchStarted })
      this.autoMatchInChat()
    }
  },
  logProgress(meta) {
    const stats = this.getDialogStats()
    const validCount = this.validAnswerCount || 0
    const eligible = validCount >= (this.qThreshold || 0)
    const why = []
    if (!eligible) why.push('未达到阈值')
    if (eligible && !this.matchStarted && !this.autoMatchTriggered) why.push('尚未触发自动匹配')
    console.log('chat-state', {
      rounds: { user: stats.userCount, assistant: stats.assistantCount },
      messageCount: stats.messageCount,
      validAnswerCount: validCount,
      qThreshold: this.qThreshold,
      eligible,
      matchStarted: !!this.matchStarted,
      autoMatchTriggered: !!this.autoMatchTriggered,
      meta: meta ? { valid_answer_count: meta.valid_answer_count, valid_answer: meta.valid_answer, cta_hint: meta.cta_hint } : null,
      not_started_reason: why
    })
  },
  onStartMatch() {
    this.matchStarted = true
    const records = (this.data.messages || [])
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content || '' }))
    const payloadText = JSON.stringify({ records })
    wx.navigateTo({
      url: '/pages/wait/wait',
      success: (res) => {
        res.eventChannel && res.eventChannel.emit('matchPayload', { messages: payloadText, match_id: 0 })
      }
    })
  }
  ,autoMatchInChat() {
    if (this.matchStarted) return
    this.matchStarted = true
    this.autoMatchTriggered = true
    const ccgapi = require('../../api/ccgapi')
    const records = (this.data.messages || [])
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content || '' }))
    const payloadText = JSON.stringify({ records })
    const stats = this.getDialogStats()
    console.log('match_in_chat start', { payloadLen: payloadText.length, rounds: { user: stats.userCount, assistant: stats.assistantCount }, validAnswerCount: this.validAnswerCount, qThreshold: this.qThreshold })
    ccgapi.matchInChat({ messages: payloadText })
      .then((resp) => {
        console.log('match_in_chat result', { match_id: resp && resp.match_id, products_count: Array.isArray(resp && resp.products) ? resp.products.length : 0 })
        const products = Array.isArray(resp && resp.products) ? resp.products : []
        const say = { role: 'assistant', content: '我了解到你的想法了，找了一些礼物给你看看。' }
        const cards = { type: 'products', products }
        const list = (this.data.messages || []).concat([say])
        this.setData({ messages: list, scrollInto: 'end-anchor' })
        const next = (this.data.messages || []).concat([cards])
        const prodAnchor = 'prod-anchor'
        this.setData({ messages: next, prodCurrent: 0, selectedProductIndex: 0 })
        wx.nextTick(() => {
          this.setData({ scrollInto: prodAnchor })
          setTimeout(() => this.setData({ scrollInto: prodAnchor }), 0)
          setTimeout(() => this.setData({ scrollInto: prodAnchor }), 3000)
        })
      })
      .catch((e) => {
        console.error('match_in_chat error', e)
      })
  }
  ,onOpenProduct(e) {
    const idx = e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.index
    const i = Number(idx) || 0
    const cardsMsg = (this.data.messages || []).find(m => m && m.type === 'products')
    const arr = cardsMsg && Array.isArray(cardsMsg.products) ? cardsMsg.products : []
    const p = arr[i]
    if (!p) { console.log('open product miss', { index: i }); return }
    const pid = Number(p.product_id) || 0
    if (pid) {
      wx.navigateTo({ url: `/pages/product/product?pid=${pid}` })
    } else {
      wx.showToast({ title: '商品详情暂不可用', icon: 'none' })
    }
  }
  ,getDialogStats() {
    const msgs = Array.isArray(this.data.messages) ? this.data.messages : []
    let userCount = 0
    let assistantCount = 0
    for (const m of msgs) {
      if (m.role === 'user') userCount++
      else if (m.role === 'assistant') assistantCount++
    }
    return { userCount, assistantCount, messageCount: msgs.length }
  }
  ,scrollToEnd() {
    this.setData({ scrollInto: 'end-anchor' })
    setTimeout(() => this.setData({ scrollInto: 'end-anchor' }), 0)
  }
  ,onProdSwiperChange(e) {
    const idx = e.detail && typeof e.detail.current === 'number' ? e.detail.current : 0
    this.setData({ prodCurrent: idx, selectedProductIndex: idx })
  }
  ,selectProduct(e) {
    const idx = e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.index
    const i = Number(idx) || 0
    this.setData({ selectedProductIndex: i, prodCurrent: i })
  }
})
