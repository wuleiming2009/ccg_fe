const request = require('./request');
const ccgapiComponents = require('./ccgapiComponents');

/**
 * 微信小程序用户登录
 * @param {ccgapiComponents.LoginReq} req
 * @returns {Promise<ccgapiComponents.LoginResp>}
 */
function login(req) {
  const payload = ccgapiComponents.LoginReq(req);
  return request.post('/user/v1/login', payload).then((resp) => {
    const out = ccgapiComponents.LoginResp(resp);
    return out;
  });
}

/**
 * 每日欢迎语
 * @param {ccgapiComponents.WelcomeStringReq} req
 * @returns {Promise<ccgapiComponents.WelcomeStringResp>}
 */
function welcomeString(req) {
  const payload = ccgapiComponents.WelcomeStringReq(req);
  return request.post('/ai/v1/welcome_string', payload).then((resp) => {
    const out = ccgapiComponents.WelcomeStringResp(resp);
    return out;
  });
}

/**
 * 每日欢迎语
 * @param {ccgapiComponents.UserInitReq} req
 * @returns {Promise<ccgapiComponents.UserInitResp>}
 */
function userInit(req) {
  const payload = ccgapiComponents.UserInitReq(req);
  return request.post('/user/v1/init', payload).then((resp) => {
    const out = ccgapiComponents.UserInitResp(resp);
    return out;
  });
}

module.exports = { login, welcomeString, userInit };
