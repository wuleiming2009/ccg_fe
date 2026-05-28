# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UniApp + Vue3 WeChat mini-program for a gift e-commerce platform (CCG). Communicates with a Go backend via REST API.

## Build Commands

```bash
# Development (watch mode with hot reload)
npm run dev:mp-weixin

# Production build
npm run build:mp-weixin
```

## Architecture

```
ccg_fe/
├── api/              # API client layer
│   ├── ccgapi.js           # High-level API methods (login, orders, products, etc.)
│   ├── ccgapiComponents.js # Request/response type transformers
│   └── request.js          # Low-level HTTP wrapper using wx.request
├── config/           # Environment configuration
│   └── env.js               # Mode (dev/test/prod), baseUrl, template IDs
├── pages/            # Mini-program pages (auto-generated/managed by uni-app)
├── custom-tab-bar/  # Custom tab bar components
├── images/          # Static image assets
├── utils/           # Utility functions (money formatting, etc.)
├── App.vue          # App entry component
├── app.json         # UniApp app configuration
├── app.wxss         # Global styles
├── main.js          # Application entry point
├── manifest.json    # UniApp manifest (permissions, appid, etc.)
├── project.config.json  # WeChat devtools project config
├── project.private.config.json  # Private overrides (appid, etc.)
├── pages.json       # Page routing configuration
├── sitemap.json     # SEO sitemap
└── uni.scss         # UniApp SCSS variables
```

## API Structure

### request.js
Low-level HTTP wrapper around `wx.request`. Handles:
- Base URL拼接 (dev: `192.168.31.158:8888`, test: `ccgapi-test.x-four.cn`, prod: `ccgapi.x-four.cn`)
- JWT token injection from `wx.getStorageSync('token')`
- Response normalization (code=200 = success, code=401 = redirect to login)
- Error handling with `wx.showToast`

Exports: `request.get()`, `request.post()`

### ccgapiComponents.js
Type transformers for API request/response. Functions like `LoginReq()`, `LoginResp()`, `MarketListResp()` normalize data between frontend and backend (e.g., converting cents to yuan prices).

### ccgapi.js
High-level API methods. All use `request.post()` and chain through ccgapiComponents transformers.

Key modules:
- **User**: `login`, `userInit`, `userInfo`, `setInfo`, `decodePhone`
- **AI/Matching**: `welcomeString`, `match`, `matchInChat`, `matchList`, `matchInfo`
- **Products**: `marketList`, `productSearch`, `productInfo`, `setProductLike`, `productLikes`
- **Recipients**: `recipientAdd`, `recipientEdit`, `recipientDel`, `recipientList`
- **Orders**: `orderNew`, `orderInfo`, `orderCheckPayment`, `paymentPrepay`, `orderListByTime`
- **Storage**: `cosPostPolicy`, `userCosPutSign` (Tencent Cloud COS uploads)

## Key Config Files

### config/env.js
```js
{
  mode: "prod",           // dev | test | prod
  baseUrl: "https://ccgapi.x-four.cn",
  orderMsgTemplateId: 'umRi-X1_757rKSPrcJa1_SJQ_hZ8t7H7rjqcnLouwGg',
  guideTest: false,       // Force show new user guide
  quickMatch: false       // Trigger recommendations after 2 chat messages
}
```

### project.config.json
WeChat mini-program project configuration:
- `appid`: wxde25161ff9df4379
- `libVersion`: 2.19.4
- `compileType`: miniprogram

## API Conventions

- All API calls use `POST` with JSON body
- JWT token stored in `wx.getStorageSync('token')` and sent in `Authorization` header
- Backend returns `{ code, data, message }` where code=200 is success
- Price values are stored as cents in backend, converted to yuan via `money.centsToYuan()` in ccgapiComponents
- Login page: `/pages/login/login`