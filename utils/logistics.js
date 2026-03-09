function buildLogisticsUrl({ nu, com, provider }) {
  const num = String(nu || '').trim()
  const company = String(com || '').trim()
  const pvd = String(provider || 'kuaidi100').trim()
  if (!num) return ''
  if (pvd === 'sf' || pvd === 'shunfeng' || (company && /sf|shunfeng/i.test(company))) {
    const base = 'https://m.kuaidi100.com/result.jsp'
    const qs = '?nu=' + encodeURIComponent(num) + '&com=' + encodeURIComponent('shunfeng')
    return base + qs
  }
  if (pvd === 'sf_official') {
    return 'https://www.sf-express.com/chn/sc/waybill/list'
  }
  if (pvd === 'cainiao') {
    return 'https://global.cainiao.com/detail.htm?mailNo=' + encodeURIComponent(num) + '&lang=zh_CN'
  }
  if (pvd === 'kuaidi100') {
    const base = 'https://m.kuaidi100.com/result.jsp'
    const qs = '?nu=' + encodeURIComponent(num) + (company ? ('&com=' + encodeURIComponent(company)) : '')
    return base + qs
  }
  return 'https://m.kuaidi100.com/result.jsp?nu=' + encodeURIComponent(num)
}

module.exports = { buildLogisticsUrl }
