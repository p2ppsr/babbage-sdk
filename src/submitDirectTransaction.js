const communicator = require('./utils/communicator')
const makeHttpRequest = require('./utils/makeHttpRequest')

/**
 * Submits a transaction directly to a ninja
 * @param {Object} obj All parameters for this function are provided in an object
 * @param {string} obj.protocol Specify the transaction submission payment protocol to use. Currently, the only supported protocol is that with BRFC ID "3241645161d8"
 * @param {Object} obj.transaction The transaction envelope to submit, including key derivation information
 * @param {string} obj.senderIdentityKey Provide the identity key for the person who sent the transaction
 * @param {string} obj.note Human-readable description for the transaction
 * @param {Number} obj.amount Amount of satoshis associated with the transaction
 * @param {string} [obj.derivationPrefix] A derivation prefix used for all outputs. If provided, derivation prefixes on all outputs are optional.
 * @returns {Promise<Object>} Object containing reference number, status=success, and human-readable note acknowledging the transaction
 */
module.exports = async ({
    protocol,
    transaction,
    senderIdentityKey,
    note,
    amount,
    derivationPrefix
}) => {
  let com // Has to be declared as variable because we need to test it inside the catch
  try {
    com = await communicator()
    if (com.substrate === 'cicada-api') {
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
            derivationPrefix
          })
        }
      )
      return httpResult
    }
    if (com.substrate === 'babbage-xdm') {
      const ids = {}
      return new Promise(resolve => {
        const id = Buffer.from(require('crypto').randomBytes(8)).toString('base64')
        window.addEventListener('message', async e => {
          if (e.data.type !== 'CWI' || !e.isTrusted || e.data.id !== id) return
          ids[id] = e.data.result
          resolve(e.data.result)
          delete ids[id]
        })
        window.parent.postMessage({
          type: 'CWI',
          id,
          call: 'submitDirectTransaction',
          params: {
            protocol,
            transaction,
            senderIdentityKey,
            note,
            amount,
            derivationPrefix
          }
        }, '*')
      })
    }
  } catch (e) {
    if (e.code === 'ERR_NO_METANET_IDENTITY' && com.substrate === 'babbage-xdm') {
      // TODO: If substrate is babbage-xdm then send message to parent and call CWI.initialize()
    } else {
      console.error(e)
    }
  }
}
