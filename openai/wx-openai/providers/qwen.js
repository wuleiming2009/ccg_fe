const { http } = require('../core/http')

async function chat({ apiKey, model = 'qwen-turbo', messages = [], temperature = 0.7, top_p = 1, baseUrl = 'https://dashscope.aliyuncs.com' }) {
  // Ali Qwen OpenAI-compatible endpoint
  const url = baseUrl + '/compatible-mode/v1/chat/completions'
  const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey }
  const data = { model, messages, temperature, top_p, stream: false }
  const resp = await http({ url, method: 'POST', headers, data })
  const choice = resp && resp.choices && resp.choices[0]
  const content = choice && choice.message && choice.message.content
  return { content, raw: resp }
}

module.exports = { chat }
