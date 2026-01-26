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
 */
function UserInitResp(obj) {
  return { 
    questions: obj.questions,
    show_my_gifts: obj.show_my_gifts,
    show_gift_history: obj.show_gift_history,
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
      price: item.price,
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
      price: item.price,
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
      price: item.price,
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
      price: item.price,
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
  return { 
    info: {
      product_id: obj.product_id,
      img_url: obj.img_url || '',
      name: obj.name || '',
      price: obj.price || 0,
      slogan: obj.slogan || '',
      contents: obj.contents || '',
      scene: obj.scene || '',
      keywords: obj.keywords || '',
      match_text: obj.match_text || '',
      match_meaning: obj.match_meaning || '',
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
    })),
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
};
