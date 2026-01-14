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

module.exports = { 
    LoginReq, 
    LoginResp, 
    WelcomeStringReq, 
    WelcomeStringResp 
};
