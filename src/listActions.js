const connectToSubstrate = require('./utils/connectToSubstrate')
const makeHttpRequest = require('./utils/makeHttpRequest')
const getRandomID = require('./utils/getRandomID')

/**
 * Returns a list of Actions with a given label
 * @param {Object} obj All parameters are given in an object
 * @param {String} obj.label The label for the transactions to return
 * @param {Number} [obj.limit=25] Provide a limit on the number of outputs that will be returned.
 * @param {Number} [obj.offset=0] Provide an offset into the list of outputs.
 * @returns {Promise<Array<TransactionOutputDescriptor>>} A set of outputs that match the criteria
 */
module.exports = async ({
  label,
  limit = 25,
  offset = 0
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
          offset
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
          offset
        }
      }, '*')
    })
  } else if (connection.substrate === 'window-api') {
    return window.CWI.ninja.getTransactions({
      label,
      limit,
      offset
    })
  } else {
    const e = new Error(`Unknown Babbage substrate: ${connection.substrate}`)
    e.code = 'ERR_UNKNOWN_SUBSTRATE'
    throw e
  }
}
