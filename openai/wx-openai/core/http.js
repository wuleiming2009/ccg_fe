function http({ url, method = 'POST', headers = {}, data = {} }) {
  return new Promise((resolve, reject) => {
    wx.request({ url, method, header: headers, data, success: r => resolve(r.data || r), fail: reject })
  })
}

module.exports = { http }
