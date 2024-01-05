const connectToSubstrate = require('./utils/connectToSubstrate')
const makeHttpRequest = require('./utils/makeHttpRequest')
const getRandomID = require('./utils/getRandomID')

/**
 * Returns a set of transaction outputs that Dojo has tracked
 * @param {Object} obj All parameters are given in an object
 * @param {String} [obj.basket] If provided, indicates which basket the outputs should be selected from.
 * @param {Boolean} [obj.tracked] If provided, only outputs with the corresponding tracked value will be returned (true/false).
 * @param {Boolean} [obj.includeEnvelope] If provided, returns a structure with the SPV envelopes for the UTXOS that have not been spent.
 * @param {Boolean} [obj.spendable] If given as true or false, only outputs that have or have not (respectively) been spent will be returned. If not given, both spent and unspent outputs will be returned.
 * @param {String} [obj.type] If provided, only outputs of the specified type will be returned. If not provided, outputs of all types will be returned.
 * @param {Number} [obj.limit] Provide a limit on the number of outputs that will be returned.
 * @param {Number} [obj.offset] Provide an offset into the list of outputs.
 * @returns {Promise<Array<TransactionOutputDescriptor>>} A set of outputs that match the criteria
 */
module.exports = async ({
  txid,
  vout,
  basket
}) => {
  const connection = await connectToSubstrate()
  if (connection.substrate === 'cicada-api') {
    const httpResult = await makeHttpRequest(
      'http://localhost:3301/v1/ninja/unbasketOutput',
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          txid,
          vout,
          basket
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
        call: 'ninja.unbasketOutput',
        params: {
          txid,
          vout,
          basket
        }
      }, '*')
    })
  } else if (connection.substrate === 'window-api') {
    return window.CWI.ninja.unbasketOutput({
      txid,
      vout,
      basket
    })
  } else {
    const e = new Error(`Unknown Babbage substrate: ${connection.substrate}`)
    e.code = 'ERR_UNKNOWN_SUBSTRATE'
    throw e
  }
}
