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

module.exports = { 
    LoginReq, 
    LoginResp, 
    WelcomeStringReq, 
    WelcomeStringResp,
    UserInitReq,
    UserInitResp,
};
