const mode = "pro";
const baseUrl = mode === 'dev'
  ? 'http://ccgapi.x-four.cn:8888'
  : 'https://ccgapi.x-four.cn';

module.exports = { mode, baseUrl };
