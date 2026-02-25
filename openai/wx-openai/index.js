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
  return { chat }
}

module.exports = { createClient }
