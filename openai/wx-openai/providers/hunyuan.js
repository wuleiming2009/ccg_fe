const { http } = require('../core/http')

async function chat({ apiKey, model = 'hunyuan-chat', messages = [], temperature = 0.7, baseUrl = 'https://openai.weixin.qq.com' }) {
  const url = baseUrl + '/v2/chat/completions'
  const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey }
  const data = { model, messages, temperature, stream: false }
  const resp = await http({ url, method: 'POST', headers, data })
  const choice = resp && resp.choices && resp.choices[0]
  const content = choice && choice.message && choice.message.content
  return { content, raw: resp }
}

module.exports = { chat }
