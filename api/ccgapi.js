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
 * 用户配置获取
 * @param {ccgapiComponents.UserInfoReq} req
 * @returns {Promise<ccgapiComponents.UserInfoResp>}
 */
function userInfo(req) {
  const payload = ccgapiComponents.UserInfoReq(req);
  return request.post('/user/v1/info', payload).then((resp) => {
    const out = ccgapiComponents.UserInfoResp(resp);
    return out;
  });
}

/**
 * 用户配置设置
 * @param {ccgapiComponents.SetInfoReq} req
 * @returns {Promise<ccgapiComponents.SetInfoResp>}
 */
function setInfo(req) {
  const payload = ccgapiComponents.SetInfoReq(req);
  return request.post('/user/v1/set', payload).then((resp) => {
    const out = ccgapiComponents.SetInfoResp(resp);
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

function matchInChat(req) {
  const payload = ccgapiComponents.MatchInChatReq(req);
  return request.post('/ai/v1/match_in_chat', payload).then((resp) => {
    const out = ccgapiComponents.MatchInChatResp(resp);
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

/**
 *  @doc "按收礼人获取订单列表"
 * @param {ccgapiComponents.RecipientOrdersReq} req
 * @returns {Promise<ccgapiComponents.RecipientOrdersResp>}
 */
function recipientOrders(req) {
  const payload = ccgapiComponents.RecipientOrdersReq(req);
  return request.post('/order/v1/list_by_recipient', payload).then((resp) => {
    const out = ccgapiComponents.RecipientOrdersResp(resp);
    return out;
  });
}

function recipientListByOrders(req) {
  const payload = ccgapiComponents.RecipientListByOrdersReq(req);
  return request.post('/recipient/v1/list_by_orders', payload).then((resp) => {
    const out = ccgapiComponents.RecipientListByOrdersResp(resp);
    return out;
  });
}

/**
 *  @doc "新建订单"
 * @param {ccgapiComponents.OrderNewReq} req
 * @returns {Promise<ccgapiComponents.OrderNewResp>}
 */
function orderNew(req) {
  const payload = ccgapiComponents.OrderNewReq(req);
  return request.post('/order/v1/new', payload).then((resp) => {
    const out = ccgapiComponents.OrderNewResp(resp);
    return out;
  });
}

/**
 *  @doc "检查订单支付状态"
 * @param {ccgapiComponents.OrderCheckPaymentReq} req
 * @returns {Promise<ccgapiComponents.OrderCheckPaymentResp>}
 */
function orderCheckPayment(req) {
  const payload = ccgapiComponents.OrderCheckPaymentReq(req);
  return request.post('/order/v1/check_payment', payload).then((resp) => {
    const out = ccgapiComponents.OrderCheckPaymentResp(resp);
    return out;
  });
}

/**
 *  @doc "订单信息"
 * @param {ccgapiComponents.OrderInfoReq} req
 * @returns {Promise<ccgapiComponents.OrderInfoResp>}
 */
function orderInfo(req) {
  const payload = ccgapiComponents.OrderInfoReq(req);
  return request.post('/order/v1/info', payload).then((resp) => {
    const out = ccgapiComponents.OrderInfoResp(resp);
    return out;
  });
}

/**
 *  @doc "预支付"
 * @param {ccgapiComponents.PaymentPrepayReq} req
 * @returns {Promise<ccgapiComponents.PaymentPrepayResp>}
 */
function paymentPrepay(req) {
  const payload = ccgapiComponents.PaymentPrepayReq(req);
  return request.post('/payment/v1/prepay', payload).then((resp) => {
    const out = ccgapiComponents.PaymentPrepayResp(resp);
    return out;
  });
}

/**
 *  @doc "根据时间获取订单列表"
 * @param {ccgapiComponents.OrderListByTimeReq} req
 * @returns {Promise<ccgapiComponents.OrderListByTimeResp>}
 */
function orderListByTime(req) {
  const payload = ccgapiComponents.OrderListByTimeReq(req);
  return request.post('/order/v1/list_by_time', payload).then((resp) => {
    const out = ccgapiComponents.OrderListByTimeResp(resp);
    return out;
  });
}

/**
 * 填写收礼信息
 * @param {ccgapiComponents.SetOrderRecipientReq} req
 * @returns {Promise<ccgapiComponents.SetOrderRecipientResp>}
 */
function setOrderRecipient(req) {
  const payload = ccgapiComponents.SetOrderRecipientReq(req);
  return request.post('/order/v1/set_order_recipient', payload).then((resp) => {
    const out = ccgapiComponents.SetOrderRecipientResp(resp);
    return out;
  });
}

module.exports = { 
  login, 
  welcomeString, 
  userInit, 
  userInfo,
  setInfo,
  match, 
  matchInChat,
  matchList, 
  matchInfo,
  marketList,
  productInfo,
  recipientAdd,
  recipientEdit,
  recipientDel,
  recipientList,
  recipientOrders,
  orderNew,
  orderCheckPayment,
  orderInfo,
  paymentPrepay,
  recipientListByOrders,
  orderListByTime,
  setOrderRecipient
  ,getOrderStatus
};
/**
 * 检查订单状态
 * @param {ccgapiComponents.GetOrderStatusReq} req
 * @returns {Promise<ccgapiComponents.GetOrderStatusResp>}
 */
function getOrderStatus(req) {
  const payload = ccgapiComponents.GetOrderStatusReq(req);
  return request.post('/order/v1/get_order_status', payload).then((resp) => {
    const out = ccgapiComponents.GetOrderStatusResp(resp);
    return out;
  });
}
