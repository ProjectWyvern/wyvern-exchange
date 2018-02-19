const axios = require('axios')
const querystring = require('querystring')
const BigNumber = require('bignumber.js')

const { WyvernProtocol } = require('wyvern-js')

const feeRecipient = '0x11db40014E2985c360B3f2A4bA350fBf104Dc326'

const errors = {
  INVALID_HASH: 'invalid_hash'
}

var assetFromJSON
var settlementFromJSON
var orderFromJSON

assetFromJSON = (asset) => {
  if (asset.orders) {
    asset.orders = asset.orders.map(orderFromJSON)
  }
  return asset
}

settlementFromJSON = (settlement) => {
  settlement.price = new BigNumber(settlement.price)
  if (settlement.order) {
    settlement.order = orderFromJSON(settlement.order)
  }
  return settlement
}

orderFromJSON = (order) => {
  const hash = WyvernProtocol.getOrderHashHex(order)
  if (hash !== order.hash) {
    throw new Error(errors.INVALID_HASH)
  }
  var fromJSON = {
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
  if (order.asset) fromJSON.asset = assetFromJSON(order.asset)
  if (order.settlement) fromJSON.settlement = settlementFromJSON(order.settlement)
  return fromJSON
}

const objToQuery = (obj) => {
  if (obj) {
    return '?' + querystring.stringify(obj)
  } else {
    return ''
  }
}

class WyvernExchange {
  constructor (endpoint) {
    this.endpoint = endpoint
  }

  async settlements (query) {
    const response = await axios.get(`${this.endpoint}/v0/settlements${objToQuery(query)}`)
    return response.data.result.map(settlementFromJSON)
  }

  async settlement (transactionHashIndex) {
    const response = await axios.get(`${this.endpoint}/v0/settlements/transactionHashIndex`)
    return settlementFromJSON(response.data.result)
  }

  async assets (query) {
    const response = await axios.get(`${this.endpoint}/v0/assets${objToQuery(query)}`)
    return response.data.result.map(assetFromJSON)
  }

  async asset (hash) {
    const response = await axios.get(`${this.endpoint}/v0/assets/{hash}`)
    return assetFromJSON(response.data.result)
  }

  async trackAsset (asset) {
    return axios.post(`${this.endpoint}/v0/assets/track`, asset)
  }

  async orders (query) {
    const response = await axios.get(`${this.endpoint}/v0/orders${objToQuery(query)}`)
    return response.data.result.map(orderFromJSON)
  }

  async order (hash) {
    const response = await axios.get(`${this.endpoint}/v0/orders/${hash}`)
    return orderFromJSON(response.data.result)
  }

  async validateOrder (order) {
    return axios.post(`${this.endpoint}/v0/orders/validate`, order)
  }

  async postOrder (order) {
    return axios.post(`${this.endpoint}/v0/orders/post`, order)
  }
}

module.exports = { WyvernExchange, errors, feeRecipient }
