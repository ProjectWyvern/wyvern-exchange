const axios = require('axios')
const BigNumber = require('bignumber.js')

const { WyvernProtocol } = require('wyvern-js')

const errors = {
  INVALID_HASH: 'invalid_hash'
}

const orderFromJSON = (order) => {
  const hash = WyvernProtocol.getOrderHashHex(order)
  if (hash !== order.hash) {
    throw new Error(errors.INVALID_HASH)
  }
  const fromJSON = {
    hash: order.hash,
    metadata: order.metadata,
    exchange: order.exchange,
    maker: order.maker,
    taker: order.taker,
    makerFee: new BigNumber(order.makerFee),
    takerFee: new BigNumber(order.takerFee),
    feeRecipient: order.feeRecipient,
    side: JSON.parse(order.side),
    saleKind: JSON.parse(order.saleKind),
    target: order.target,
    howToCall: JSON.parse(order.howToCall),
    calldata: order.calldata,
    replacementPattern: order.replacementPattern,
    staticTarget: order.staticTarget,
    staticExtradata: order.staticExtradata,
    paymentToken: order.paymentToken,
    basePrice: new BigNumber(order.basePrice),
    extra: new BigNumber(order.extra),
    listingTime: new BigNumber(order.listingTime),
    expirationTime: new BigNumber(order.expirationTime),
    salt: new BigNumber(order.salt),
    v: parseInt(order.v),
    r: order.r,
    s: order.s
  }
  return fromJSON
}

module.exports = {
  orders: async (endpoint) => {
    const response = await axios.get(`${endpoint}/v0/orders`)
    return response.data.result.map(orderFromJSON)
  },
  order: async (endpoint, hash) => {
    const response = await axios.get(`${endpoint}/v0/orders/${hash}`)
    return orderFromJSON(response.data.result)
  },
  validateOrder: async (endpoint, order) => {
    return axios.post(`${endpoint}/v0/orders/validate`, order)
  },
  postOrder: async (endpoint, order) => {
    return axios.post(`${endpoint}/v0/orders/post`, order)
  },
  errors
}
