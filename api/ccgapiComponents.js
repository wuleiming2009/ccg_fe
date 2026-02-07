const money = require('../utils/money')
/**
 * @typedef {Object} LoginReq
 * @property {string} js_code
 */
function LoginReq(input) {
  return { js_code: input.js_code };
}

/**
 * @typedef {Object} LoginResp
 * @property {string} access_token
 */
function LoginResp(obj) {
  return { access_token: obj.access_token };
}

/**
 * @typedef {Object} WelcomeStringReq
 */
function WelcomeStringReq() {
  return {};
}

/**
 * @typedef {Object} WelcomeStringResp
 * @property {string} str
 */
function WelcomeStringResp(obj) {
  return { str: obj.str };
}

/**
 * @typedef {Object} UserInitReq
 */
function UserInitReq() {
  return {};
}

/**
 * @typedef {Object} UserInitResp
 * @property {string[]} questions
 * @property {number} show_my_gifts
 * @property {number} show_gift_history
 * @property {string} user_name
 */
function UserInitResp(obj) {
  return { 
    questions: obj.questions,
    show_my_gifts: obj.show_my_gifts,
    show_gift_history: obj.show_gift_history,
    user_name: obj.user_name || ''
  };
}

/**
 * @typedef {Object} MatchReq
 * @property {string} messages
 * @property {number} match_id
 */
function MatchReq(input) {
  return { 
    messages: input.messages,
    match_id: input.match_id,
  };
}

/**
 * @typedef {Object} MatchResp
 * @property {string} reason
 * @property {Array} products
 * @property {number} match_id
 */
function MatchResp(obj) {
  const products = Array.isArray(obj.products) ? obj.products : []
  return { 
    match_id: (typeof obj.match_id === 'number' ? obj.match_id : (Number(obj.match_id) || 0)),
    reason: obj.reason || '',
    products: products.map((item) => ({
      is_ccg: item.is_ccg,
      img_url: item.img_url,
      name: item.name,
      price: money.centsToYuan(item.price),
      match_text: item.match_text,
      match_meaning: item.match_meaning,
      buy_url: item.buy_url,
    })),
  };
}

/**
 * @typedef {Object} MatchListReq
 * @property {number} page
 */
function MatchListReq(input) {
  return { 
    page: input.page,
  };
}

/**
 * @typedef {Object} MatchListResp
 * @property {number} page
 * @property {Array} list
 */
function MatchListResp(obj) {
  const arr = Array.isArray(obj.list) ? obj.list : (Array.isArray(obj.products) ? obj.products : [])
  return { 
    page: obj.page || 1,
    list: arr.map((item) => ({
      match_id: item.match_id,
      img_url: item.img_url,
      name: item.name,
      price: money.centsToYuan(item.price),
      match_text: item.match_text,
      Time: item.Time || item.time || item.date,
    })),
  };
}

/**
 * @typedef {Object} MatchInfoReq
 * @property {number} match_id
 */
function MatchInfoReq(input) {
  return { 
    match_id: input.match_id,
  };
}

/**
 * @typedef {Object} MatchInfoResp
 * @property {number} match_id
 * @property {string} messages
 * @property {string} reason
 * @property {Array} products
 */
function MatchInfoResp(obj) {
  const products = Array.isArray(obj.products) ? obj.products : []
  return { 
    match_id: (typeof obj.match_id === 'number' ? obj.match_id : (Number(obj.match_id) || 0)),
    messages: obj.messages || '',
    reason: obj.reason || '',
    products: products.map((item) => ({
      is_ccg: item.is_ccg,
      product_id: item.product_id,
      img_url: item.img_url,
      name: item.name,
      price: money.centsToYuan(item.price),
      match_text: item.match_text,
      match_meaning: item.match_meaning,
      buy_url: item.buy_url,
    })),
  };
}

/**
 * @typedef {Object} MarketListReq
 * @property {number} page
 */
function MarketListReq(input) {
  return { 
    page: input.page,
  };
}

/**
 * @typedef {Object} MarketListResp
 * @property {number} page
 * @property {Array} list
 */
function MarketListResp(obj) {
  const arr = Array.isArray(obj.list) ? obj.list : (Array.isArray(obj.products) ? obj.products : [])
  return { 
    page: obj.page || 1,
    list: arr.map((item) => ({
      product_id: item.product_id,
      img_url: item.img_url,
      name: item.name,
      price: money.centsToYuan(item.price),
      slogan: item.slogan || '',
      contents: item.contents || '',
      scene: item.scene || '',
      keywords: item.keywords || '',
      match_text: item.match_text,
      match_meaning: item.match_meaning,
    })),
  };
}

/**
 * @typedef {Object} ProductInfoReq
 * @property {number} product_id
 */
function ProductInfoReq(input) {
  return { 
    product_id: input.product_id,
  };
}

/**
 * @typedef {Object} ProductInfoResp
 * @property {Object} info
 */
function ProductInfoResp(obj) {
  const src = obj && (obj.info || obj.product || obj) || {};
  const toNum = (v) => (typeof v === 'number' ? v : (Number(v) || 0));
  return {
    info: {
      product_id: src.product_id || obj.product_id || 0,
      img_url: src.img_url || obj.img_url || '',
      name: src.name || obj.name || '',
      price: money.centsToYuan(toNum(src.price != null ? src.price : obj.price)),
      slogan: src.slogan || obj.slogan || '',
      contents: src.contents || obj.contents || '',
      scene: src.scene || obj.scene || '',
      keywords: src.keywords || obj.keywords || '',
      match_text: src.match_text || obj.match_text || '',
      match_meaning: src.match_meaning || obj.match_meaning || '',
    }
  };
}

/**
 * @typedef {Object} RecipientAddReq
 * @property {string} nickname
 * @property {string} phone
 * @property {string} address
 */
function RecipientAddReq(input) {
  return { 
    nickname: input.nickname,
    phone: input.phone,
    address: input.address,
  };
}

/**
 * @typedef {Object} RecipientAddResp
 * @property {number} success
 */
function RecipientAddResp(obj) {
  return { 
    success: obj.success || "",
  };
}

/**
 * @typedef {Object} RecipientEditReq
 * @property {number} recipient_id
 * @property {string} nickname
 * @property {string} phone
 * @property {string} address
 */
function RecipientEditReq(input) {
  return { 
    recipient_id: input.recipient_id,
    nickname: input.nickname,
    phone: input.phone,
    address: input.address,
    is_default: input.is_default,
  };
}

/**
 * @typedef {Object} RecipientEditResp
 * @property {number} success
 */
function RecipientEditResp(obj) {
  return { 
    success: obj.success || "",
  };
}

/**
 * @typedef {Object} RecipientDelReq
 * @property {number} recipient_id
 */
function RecipientDelReq(input) {
  return { 
    recipient_id: input.recipient_id,
  };
}

/**
 * @typedef {Object} RecipientDelResp
 * @property {number} success
 */
function RecipientDelResp(obj) {
  return { 
    success: obj.success || "",
  };
}

/**
 * @typedef {Object} RecipientListReq
 * @property {number} page
 */
function RecipientListReq(input) {
  return { 
    page: input.page,
  };
}

/**
 * @typedef {Object} RecipientListResp
 * @property {number} page
 * @property {Array} list
 */
function RecipientListResp(obj) {
  const arr = Array.isArray(obj.list) ? obj.list : (Array.isArray(obj.recipients) ? obj.recipients : [])
  return { 
    page: obj.page || 1,
    list: arr.map((item) => ({
      recipient_id: item.recipient_id,
      nickname: item.nickname,
      phone: item.phone,
      address: item.address,
      is_default: item.is_default,
      order_count: item.order_count || item.count
    })),
  };
}

function RecipientListByOrdersReq(input) {
  return { page: input.page };
}

function RecipientListByOrdersResp(obj) {
  const arr = Array.isArray(obj.list) ? obj.list : (Array.isArray(obj.recipients) ? obj.recipients : [])
  return {
    page: obj.page || 1,
    list: arr.map((item) => ({
      recipient_id: item.recipient_id,
      nickname: item.nickname,
      phone: item.phone,
      address: item.address,
      order_count: item.order_count || item.count
    })),
  };
}

/**
 * @typedef {Object} RecipientOrdersReq
 * @property {number} recipient_id
 * @property {number} page
 */
function RecipientOrdersReq(input) {
  return { 
    recipient_id: input.recipient_id,
    page: input.page || 1,
  };
}

/**
 * @typedef {Object} RecipientOrdersResp
 * @property {number} page
 * @property {Array} list
 */
function RecipientOrdersResp(obj) {
  const arr = Array.isArray(obj.list) ? obj.list : (Array.isArray(obj.orders) ? obj.orders : [])
  return { 
    page: obj.page || 1,
    list: arr.map((item) => {
      const p = item.product || {}
      const toNum = (v) => (typeof v === 'number' ? v : (Number(v) || 0))
      const priceCents = (item.amount_paid != null ? toNum(item.amount_paid) : (p.price != null ? toNum(p.price) : toNum(item.price)))
      const statusMap = { 0: '待支付', 1: '已支付', 2: '已取消', 3: '已关闭', 4: '已退款' }
      const orderStatus = toNum(item.order_status)
      return {
        order_id: item.order_id || item.id,
        product_id: p.product_id || item.product_id,
        img_url: p.img_url || item.img_url || '',
        name: p.name || item.name || '',
        qty: item.quantity != null ? toNum(item.quantity) : (item.qty || 1),
        code: item.code || item.order_code || '',
        price: money.centsToYuan(priceCents),
        amount_total: money.centsToYuan(toNum(item.amount_total)),
        amount_paid: money.centsToYuan(toNum(item.amount_paid)),
        order_status: orderStatus,
        order_status_text: statusMap[orderStatus] || '',
        date: item.date || item.time || item.created_at || '',
        create_time: item.create_time || item.created_at || item.date || '',
      }
    }),
  };
}

/**
 * @typedef {Object} OrderCheckPaymentReq
 * @property {number} order_id
 */
function OrderCheckPaymentReq(input) {
  return { order_id: input.order_id };
}

/**
 * @typedef {Object} OrderCheckPaymentResp
 * @property {number} status
 */
function OrderCheckPaymentResp(obj) {
  return { status: (typeof obj.status === 'number' ? obj.status : (Number(obj.status) || 0)) };
}

/**
 * @typedef {Object} OrderInfoReq
 * @property {number} order_id
 */
function OrderInfoReq(input) {
  return { order_id: input.order_id };
}

/**
 * @typedef {Object} OrderInfoResp
 */
function OrderInfoResp(obj) {
  const p = obj.product || {};
  const r = obj.recipient || {};
  const toNum = (v) => (typeof v === 'number' ? v : (Number(v) || 0));
  return {
    order_id: toNum(obj.order_id),
    product: {
      product_id: toNum(p.product_id),
      img_url: p.img_url || '',
      name: p.name || '',
      price: money.centsToYuan(toNum(p.price)),
      slogan: p.slogan || '',
      contents: p.contents || '',
      scene: p.scene || '',
      keywords: p.keywords || '',
      match_text: p.match_text || '',
      match_meaning: p.match_meaning || '',
    },
    quantity: toNum(obj.quantity),
    amount_total: money.centsToYuan(toNum(obj.amount_total)),
    amount_paid: money.centsToYuan(toNum(obj.amount_paid)),
    order_status: toNum(obj.order_status),
    recipient: {
      recipient_id: toNum(r.recipient_id),
      nickname: r.nickname || '',
      phone: r.phone || '',
      address: r.address || '',
    },
    create_time: obj.create_time || '',
  };
}

/**
 * @typedef {Object} PaymentPrepayReq
 * @property {number} order_id
 */
function PaymentPrepayReq(input) {
  return { order_id: input.order_id };
}

/**
 * @typedef {Object} PaymentPrepayResp
 * @property {string} time_stamp
 * @property {string} nonce_str
 * @property {string} package
 * @property {string} sign_type
 * @property {string} paySign
 */
function PaymentPrepayResp(obj) {
  return {
    time_stamp: String(obj.time_stamp || obj.timeStamp || ''),
    nonce_str: String(obj.nonce_str || obj.nonceStr || ''),
    package: String(obj.package || ''),
    sign_type: String(obj.sign_type || obj.signType || ''),
    paySign: String(obj.paySign || obj.paysign || ''),
  };
}

/**
 * @typedef {Object} OrderListByTimeReq
 * @property {number} page
 */
function OrderListByTimeReq(input) {
  return { page: input.page };
}

/**
 * @typedef {Object} OrderListByTimeResp
 * @property {number} page
 * @property {Array} list
 */
function OrderListByTimeResp(obj) {
  const arr = Array.isArray(obj.list) ? obj.list : []
  return {
    page: obj.page || 1,
    list: arr.map((item) => OrderInfoResp(item)),
  };
}

module.exports = { 
    LoginReq, 
    LoginResp, 
    WelcomeStringReq, 
    WelcomeStringResp,
    UserInitReq,
    UserInitResp,
    MatchReq,
    MatchResp,
    MatchListReq,
    MatchListResp,
    MatchInfoReq,
    MatchInfoResp,
    MarketListReq,
    MarketListResp,
    ProductInfoReq,
    ProductInfoResp,
    RecipientAddReq,
    RecipientAddResp,
    RecipientEditReq,
    RecipientEditResp,
    RecipientDelReq,
    RecipientDelResp,
    RecipientListReq,
    RecipientListResp,
    RecipientOrdersReq,
    RecipientOrdersResp,
    OrderNewReq,
    OrderNewResp,
    OrderCheckPaymentReq,
    OrderCheckPaymentResp,
    OrderInfoReq,
    OrderInfoResp,
    PaymentPrepayReq,
    PaymentPrepayResp,
    RecipientListByOrdersReq,
    RecipientListByOrdersResp,
    OrderListByTimeReq,
    OrderListByTimeResp,
};
/**
 * @typedef {Object} OrderNewReq
 * @property {number} product_id
 * @property {number} quantity
 * @property {number} recipient_id
 */
function OrderNewReq(input) {
  return {
    product_id: input.product_id,
    quantity: input.quantity,
    // 后端字段为 recipient_d，这里做映射
    recipient_d: input.recipient_id,
  };
}

/**
 * @typedef {Object} OrderNewResp
 * @property {number} order_id
 */
function OrderNewResp(obj) {
  return {
    order_id: (typeof obj.order_id === 'number' ? obj.order_id : (Number(obj.order_id) || 0)),
  };
}
