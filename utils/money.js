function centsToYuan(input) {
  const n = Number(input) || 0
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(Math.trunc(n))
  const yuan = Math.floor(abs / 100)
  const cent = abs % 100
  const centStr = String(cent).padStart(2, '0')
  return sign + yuan + '.' + centStr
}

module.exports = { centsToYuan }

