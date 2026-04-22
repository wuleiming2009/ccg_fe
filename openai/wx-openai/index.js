const deepseek = require('./providers/deepseek')
const hunyuan = require('./providers/hunyuan')
const qwen = require('./providers/qwen')

function createClient({ provider, apiKey, baseUrl, model, defaults = {} }) {
  async function chat({ messages, temperature, top_p }) {
    if (provider === 'deepseek') return deepseek.chat({ apiKey, baseUrl, model, messages, temperature, top_p, ...defaults })
    if (provider === 'hunyuan') return hunyuan.chat({ apiKey, baseUrl, model, messages, temperature, ...defaults })
    if (provider === 'qwen') return qwen.chat({ apiKey, baseUrl, model, messages, temperature, top_p, ...defaults })
    throw new Error('unsupported provider')
  }
  function chatStream({ messages, temperature, top_p, onChunk, onComplete, onError }) {
    if (provider === 'deepseek') return deepseek.chatStream({ apiKey, baseUrl, model, messages, temperature, top_p, ...defaults, onChunk, onComplete, onError })
    if (provider === 'hunyuan') return hunyuan.chatStream && hunyuan.chatStream({ apiKey, baseUrl, model, messages, temperature, ...defaults, onChunk, onComplete, onError })
    if (provider === 'qwen') return qwen.chatStream({ apiKey, baseUrl, model, messages, temperature, top_p, ...defaults, onChunk, onComplete, onError })
    throw new Error('unsupported provider')
  }
  return { chat, chatStream }
}

module.exports = { createClient }
