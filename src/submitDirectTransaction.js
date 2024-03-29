const connectToSubstrate = require('./utils/connectToSubstrate')
const makeHttpRequest = require('./utils/makeHttpRequest')
const getRandomID = require('./utils/getRandomID')

/**
 * Submits a transaction directly to a ninja
 * @param {Object} obj All parameters for this function are provided in an object
 * @param {string} obj.protocol Specify the transaction submission payment protocol to use. Currently, the only supported protocol is that with BRFC ID "3241645161d8"
 * @param {Object} obj.transaction The transaction envelope to submit, including key derivation information
 * @param {string} obj.senderIdentityKey Provide the identity key for the person who sent the transaction
 * @param {string} obj.note Human-readable description for the transaction
 * @param {Number} obj.amount Amount of satoshis associated with the transaction
 * @param {string} [obj.derivationPrefix] A derivation prefix used for all outputs. If provided, derivation prefixes on all outputs are optional.
 * @param {Array<String>} [obj.labels] Labels to apply to the submitted transaction
 * @returns {Promise<Object>} Object containing reference number, status=success, and human-readable note acknowledging the transaction
 */
module.exports = async ({
  protocol,
  transaction,
  senderIdentityKey,
  note,
  amount,
  labels,
  derivationPrefix
}) => {
  const connection = await connectToSubstrate()
  if (connection.substrate === 'cicada-api') {
    const httpResult = await makeHttpRequest(
      'http://localhost:3301/v1/ninja/submitDirectTransaction',
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          protocol,
          transaction,
          senderIdentityKey,
          note,
          amount,
          labels,
          derivationPrefix
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
        call: 'ninja.submitDirectTransaction',
        params: {
          protocol,
          transaction,
          senderIdentityKey,
          note,
          amount,
          labels,
          derivationPrefix
        }
      }, '*')
    })
  } else if (connection.substrate === 'window-api') {
    return window.CWI.ninja.submitDirectTransaction({
      protocol,
      transaction,
      senderIdentityKey,
      note,
      amount,
      labels,
      derivationPrefix
    })
  } else {
    const e = new Error(`Unknown Babbage substrate: ${connection.substrate}`)
    e.code = 'ERR_UNKNOWN_SUBSTRATE'
    throw e
  }
}
