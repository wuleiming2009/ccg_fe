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

/**
 * 获取集市商品列表
 * @param {ccgapiComponents.MarketListReq} req
 * @returns {Promise<ccgapiComponents.MarketListResp>}
 */
function marketList(req) {
  const payload = ccgapiComponents.MarketListReq(req);
  return request.post('/product/v1/market/list', payload).then((resp) => {
    const out = ccgapiComponents.MarketListResp(resp);
    return out;
  });
}

/**
 * 获取集市商品详情
 * @param {ccgapiComponents.ProductInfoReq} req
 * @returns {Promise<ccgapiComponents.ProductInfoResp>}
 */
function productInfo(req) {
  const payload = ccgapiComponents.ProductInfoReq(req);
  return request.post('/product/v1/info', payload).then((resp) => {
    const out = ccgapiComponents.ProductInfoResp(resp);
    return out;
  });
}

/**
 * 添加收礼人
 * @param {ccgapiComponents.RecipientAddReq} req
 * @returns {Promise<ccgapiComponents.RecipientAddResp>}
 */
function recipientAdd(req) {
  const payload = ccgapiComponents.RecipientAddReq(req);
  return request.post('/recipient/v1/add', payload).then((resp) => {
    const out = ccgapiComponents.RecipientAddResp(resp);
    return out;
  });
}

/**
 * 编辑收礼人
 * @param {ccgapiComponents.RecipientEditReq} req
 * @returns {Promise<ccgapiComponents.RecipientEditResp>}
 */
function recipientEdit(req) {
  const payload = ccgapiComponents.RecipientEditReq(req);
  return request.post('/recipient/v1/edit', payload).then((resp) => {
    const out = ccgapiComponents.RecipientEditResp(resp);
    return out;
  });
}

/**
 * 	@doc "删除收礼人"
 * @param {ccgapiComponents.RecipientDelReq} req
 * @returns {Promise<ccgapiComponents.RecipientDelResp>}
 */
function recipientDel(req) {
  const payload = ccgapiComponents.RecipientDelReq(req);
  return request.post('/recipient/v1/del', payload).then((resp) => {
    const out = ccgapiComponents.RecipientDelResp(resp);
    return out;
  });
}

/**
 * 	@doc "收礼人列表"
 * @param {ccgapiComponents.RecipientListReq} req
 * @returns {Promise<ccgapiComponents.RecipientListResp>}
 */
function recipientList(req) {
  const payload = ccgapiComponents.RecipientListReq(req);
  return request.post('/recipient/v1/list', payload).then((resp) => {
    const out = ccgapiComponents.RecipientListResp(resp);
    return out;
  });
}

module.exports = { 
  login, 
  welcomeString, 
  userInit, 
  match, 
  matchList, 
  matchInfo,
  marketList,
  productInfo,
  recipientAdd,
  recipientEdit,
  recipientDel,
  recipientList
};
