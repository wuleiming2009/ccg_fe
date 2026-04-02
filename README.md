# CCG礼赠顾问 (Wechat-UniApp)

微信小程序项目，基于 uni-app 框架的 AI 礼物推荐平台。

## 环境要求

- **Node.js**: v18+ (推荐)
- **npm**: v8+ (随 Node.js 附带)

## 环境配置

编辑 `config/env.js` 中的 `mode` 切换环境：

| mode | baseUrl | 说明 |
|------|---------|------|
| dev | http://192.168.31.161:8888 | 本地开发环境 |
| test | https://ccgapi-test.x-four.cn | 测试环境 |
| prod | https://ccgapi.x-four.cn | 生产环境 |

## 开发与构建

小程序工具指向项目根目录即可。

## 项目结构

```
├── api/              # API 接口封装
├── config/           # 配置文件
│   └── env.js       # 环境配置 (dev/test/prod)
├── images/           # 图片资源
├── pages/            # 页面目录
│   ├── chat/        # AI 礼物助手 (TabBar)
│   ├── market/      # 礼物甄选 (TabBar)
│   ├── my/          # 会员管家 (TabBar)
│   ├── history/     # 历史咨询记录
│   ├── profile/     # 设置/个人信息
│   └── ...
├── static/           # 静态资源
├── utils/           # 工具函数
├── app.js           # 应用入口
├── app.json         # 应用配置
└── app.wxss         # 全局样式
```

## 页面说明

| 页面 | 路径 | 说明 |
|------|------|------|
| AI礼物助手 | /pages/chat/chat | TabBar 首页，聊天咨询 |
| 礼物甄选 | /pages/market/market | TabBar 商品浏览 |
| 会员管家 | /pages/my/my | TabBar 用户中心 |
| 历史咨询记录 | /pages/history/history | 聊天历史列表 |
| 设置 | /pages/profile/profile | 个人信息设置 |

## 备注

- 使用微信小程序插件 `WechatSI` (v0.3.3) 支持语音识别
- 懒加载组件: `lazyCodeLoading: "requiredComponents"`
- 项目全称: CCG礼赠顾问
