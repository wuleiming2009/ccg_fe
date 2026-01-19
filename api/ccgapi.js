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

/**
 * 用户对话匹配商品
 * @param {ccgapiComponents.MatchReq} req
 * @returns {Promise<ccgapiComponents.MatchResp>}
 */
function match(req) {
  const payload = ccgapiComponents.MatchReq(req);
  return request.post('/ai/v1/match', payload).then((resp) => {
    const out = ccgapiComponents.MatchResp(resp);
    return out;
  });
}

/**
 * 用户的匹配历史
 * @param {ccgapiComponents.MatchListReq} req
 * @returns {Promise<ccgapiComponents.MatchListResp>}
 */
function matchList(req) {
  const payload = ccgapiComponents.MatchListReq(req);
  return request.post('/user/v1/match_list', payload).then((resp) => {
    const out = ccgapiComponents.MatchListResp(resp);
    return out;
  });
}

/**
 * 匹配历史详情
 * @param {ccgapiComponents.MatchInfoReq} req
 * @returns {Promise<ccgapiComponents.MatchInfoResp>}
 */
function matchInfo(req) {
  const payload = ccgapiComponents.MatchInfoReq(req);
  return request.post('/user/v1/match_info', payload).then((resp) => {
    const out = ccgapiComponents.MatchInfoResp(resp);
    return out;
  });
}

module.exports = { login, welcomeString, userInit, match, matchList, matchInfo };
