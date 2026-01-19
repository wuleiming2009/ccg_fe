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
  return { 
    match_id: obj.match_id,
    reason: obj.reason,
    products: obj.products.map((item) => ({
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

module.exports = { 
    LoginReq, 
    LoginResp, 
    WelcomeStringReq, 
    WelcomeStringResp,
    UserInitReq,
    UserInitResp,
    MatchReq,
    MatchResp,
};
