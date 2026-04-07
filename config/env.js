const mode = "prod";
const baseUrl = mode === 'dev'
  ? 'http://192.168.31.159:8888'
  : mode === 'test'
  ? 'https://ccgapi-test.x-four.cn'
  : 'https://ccgapi.x-four.cn';
const orderMsgTemplateId = 'umRi-X1_757rKSPrcJa1_SJQ_hZ8t7H7rjqcnLouwGg'
const guideTest = false // 开启后强制进入新人引导页
const quickMatch = false // 开启后对话2句即触发推荐

module.exports = { mode, baseUrl, orderMsgTemplateId, guideTest, quickMatch };
