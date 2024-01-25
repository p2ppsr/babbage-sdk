const connectToSubstrate = require('./utils/connectToSubstrate')
const makeHttpRequest = require('./utils/makeHttpRequest')
const getRandomID = require('./utils/getRandomID')

/**
 * Returns a list of Actions with a given label
 * @param {Object} obj All parameters are given in an object
 * @param {String} obj.label The label for the transactions to return
 * @param {Number} [obj.limit=25] Provide a limit on the number of outputs that will be returned.
 * @param {Number} [obj.offset=0] Provide an offset into the list of outputs.
 * @param {Boolean} [obj.addInputsAndOutputs] Optional. If true, include the list of transaction inputs and outputs when retrieving transactions. Enabling this option adds the 'inputs' and 'outputs' properties to each transaction, providing detailed information about the transaction's inputs and outputs.
 * @param {Boolean} [obj.includeBasket] Optional. If true, the basket for each input and output will be included.
 * @param {Boolean} [obj.includeTags] Optional. If true, the tags on each input and output will be included.
 * @returns {Promise<Array<TransactionOutputDescriptor>>} A set of outputs that match the criteria
 */
module.exports = async ({
  label,
  limit = 25,
  offset = 0,
  addInputsAndOutputs = false,
  includeBasket = false,
  includeTags = false
}) => {
  const connection = await connectToSubstrate()
  if (connection.substrate === 'cicada-api') {
    const httpResult = await makeHttpRequest(
      'http://localhost:3301/v1/listActions',
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          label,
          limit,
          offset,
          addInputsAndOutputs,
          includeBasket,
          includeTags
        })
      }
    )
    return httpResult
  } else if (connection.substrate === 'babbage-xdm') {
    return new Promise((resolve, reject) => {
      const id = Buffer.from(getRandomID()).toString('base64')
      window.addEventListener('message', async e => {
        if (e.data.type !== 'CWI' || !e.isTrusted || e.data.id !== id || e.data.isInvocation) return
        if (e.data.status === 'error') {
          const err = new Error(e.data.description)
          err.code = e.data.code
          reject(err)
        } else {
          resolve(e.data.result)
        }
      })
      window.parent.postMessage({
        type: 'CWI',
        isInvocation: true,
        id,
        call: 'ninja.getTransactions',
        params: {
          label,
          limit,
          offset,
          addInputsAndOutputs,
          includeBasket,
          includeTags
        }
      }, '*')
    })
  } else if (connection.substrate === 'window-api') {
    return window.CWI.ninja.getTransactions({
      label,
      limit,
      offset,
      addInputsAndOutputs,
      includeBasket,
      includeTags
    })
  } else {
    const e = new Error(`Unknown Babbage substrate: ${connection.substrate}`)
    e.code = 'ERR_UNKNOWN_SUBSTRATE'
    throw e
  }
}
