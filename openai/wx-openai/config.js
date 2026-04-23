const config = {
  deepseek: { apiKey: 'sk-a1d5d62ab76a481ca0513fb312019024', baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat' },
  hunyuan: { apiKey: '7BGwUzUctO5uotAdEyRZLqzXcx4TJZDKLRu4uVhvSg3', baseUrl: 'https://openai.weixin.qq.com', model: 'hunyuan-chat' },
  qwen: { apiKey: 'sk-8418d78c044a486e806ca567882492bf', baseUrl: 'https://dashscope.aliyuncs.com', model: 'qwen-turbo' },
  doubao: { apiKey: 'ark-68880ce6-3983-46bf-832b-e046a1b68c35-0a21e', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3', model: 'ep-20260423115457-llqw6' }
}

module.exports = { config }
