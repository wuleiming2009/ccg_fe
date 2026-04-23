const { http, httpStream } = require('../core/http')

function chat({ apiKey, model, messages = [], temperature = 0.7, top_p = 1, baseUrl = 'https://ark.cn-beijing.volces.com/api/v3' }) {
  const url = baseUrl + '/chat/completions'
  const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey }
  const data = { model, messages, temperature, top_p, stream: false }
  return http({ url, method: 'POST', headers, data }).then(resp => {
    const choice = resp && resp.choices && resp.choices[0]
    const content = choice && choice.message && choice.message.content
    return { content, raw: resp }
  })
}

function chatStream({ apiKey, model, messages = [], temperature = 0.7, top_p = 1, baseUrl = 'https://ark.cn-beijing.volces.com/api/v3', onChunk, onComplete, onError }) {
  const url = baseUrl + '/chat/completions'
  const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey }
  const data = { model, messages, temperature, top_p, stream: true }
  return httpStream({ url, method: 'POST', headers, data, onChunk, onComplete, onError })
}

module.exports = { chat, chatStream }