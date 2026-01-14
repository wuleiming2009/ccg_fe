const deepseek = require('./providers/deepseek')
const hunyuan = require('./providers/hunyuan')

function createClient({ provider, apiKey, baseUrl, model, defaults = {} }) {
  async function chat({ messages, temperature, top_p }) {
    if (provider === 'deepseek') return deepseek.chat({ apiKey, baseUrl, model, messages, temperature, top_p, ...defaults })
    if (provider === 'hunyuan') return hunyuan.chat({ apiKey, baseUrl, model, messages, temperature, ...defaults })
    throw new Error('unsupported provider')
  }
  return { chat }
}

module.exports = { createClient }
