const mode = "prod";
const baseUrl = mode === 'dev'
  ? 'http://ccgapi.x-four.cn:8888'
  : mode === 'test'
  ? 'https://ccgapi-test.x-four.cn'
  : 'https://ccgapi.x-four.cn';

module.exports = { mode, baseUrl };
