function http({ url, method = 'POST', headers = {}, data = {} }) {
  return new Promise((resolve, reject) => {
    wx.request({ url, method, header: headers, data, success: r => resolve(r.data || r), fail: reject })
  })
}

function httpStream({ url, method = 'POST', headers = {}, data = {}, onChunk, onComplete, onError }) {
  const task = wx.request({
    url,
    method,
    header: { ...headers, 'Accept': 'text/event-stream' },
    data,
    enableChunked: true,
    responseType: 'arraybuffer',
    fail: (err) => onError && onError(err),
  })
  let buffer = new Uint8Array()
  task.onChunkReceived((res) => {
    if (!res || !res.data) return
    const chunk = new Uint8Array(res.data)
    const temp = new Uint8Array(buffer.length + chunk.length)
    temp.set(buffer)
    temp.set(chunk, buffer.length)
    buffer = temp
    const text = arrayBufferToStr(buffer)
    const lines = text.split('\n')
    buffer = new Uint8Array(lines.pop() || '')
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6)
        if (jsonStr === '[DONE]') {
          onComplete && onComplete()
          return
        }
        try {
          const parsed = JSON.parse(jsonStr)
          const content = parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content
          if (content) {
            onChunk && onChunk(content)
          }
        } catch (e) {}
      }
    }
  })
  return task
}

function arrayBufferToStr(buffer) {
  try {
    const decoder = new TextDecoder('utf-8')
    return decoder.decode(buffer)
  } catch (e) {
    let result = ''
    let i = 0
    while (i < buffer.length) {
      const byte = buffer[i]
      if (byte < 0x80) {
        result += String.fromCharCode(byte)
        i++
      } else if (byte < 0xE0) {
        const char = ((byte & 0x1F) << 6) | (buffer[i + 1] & 0x3F)
        result += String.fromCharCode(char)
        i += 2
      } else if (byte < 0xF0) {
        const char = ((byte & 0x0F) << 12) | ((buffer[i + 1] & 0x3F) << 6) | (buffer[i + 2] & 0x3F)
        result += String.fromCharCode(char)
        i += 3
      } else {
        const char = ((byte & 0x07) << 18) | ((buffer[i + 1] & 0x3F) << 12) | ((buffer[i + 2] & 0x3F) << 6) | (buffer[i + 3] & 0x3F)
        result += String.fromCharCode(char)
        i += 4
      }
    }
    return result
  }
}

module.exports = { http, httpStream }
