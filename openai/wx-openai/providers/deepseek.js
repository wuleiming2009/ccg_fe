const { http, httpStream } = require('../core/http')

async function chat({ apiKey, model = 'deepseek-chat', messages = [], temperature = 0.7, top_p = 1, baseUrl = 'https://api.deepseek.com' }) {
  const url = baseUrl + '/v1/chat/completions'
  const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey }
  const data = { model, messages, temperature, top_p, stream: false }
  const resp = await http({ url, method: 'POST', headers, data })
  const choice = resp && resp.choices && resp.choices[0]
  const content = choice && choice.message && choice.message.content
  return { content, raw: resp }
}

function chatStream({ apiKey, model = 'deepseek-chat', messages = [], temperature = 0.7, top_p = 1, baseUrl = 'https://api.deepseek.com', onChunk, onComplete, onError }) {
  const url = baseUrl + '/v1/chat/completions'
  const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey }
  const data = { model, messages, temperature, top_p, stream: true }
  return httpStream({ url, method: 'POST', headers, data, onChunk, onComplete, onError })
}

module.exports = { chat, chatStream }
