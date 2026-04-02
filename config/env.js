const mode = "prod";
  ? 'http://192.168.31.161:8888'
const baseUrl = mode === 'dev'
  : mode === 'test'
  ? 'https://ccgapi-test.x-four.cn'
  : 'https://ccgapi.x-four.cn';
const orderMsgTemplateId = 'umRi-X1_757rKSPrcJa1_SJQ_hZ8t7H7rjqcnLouwGg'
const guideTest = false

module.exports = { mode, baseUrl, orderMsgTemplateId, guideTest };
