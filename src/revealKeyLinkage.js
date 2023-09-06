const connectToSubstrate = require('./utils/connectToSubstrate')
const makeHttpRequest = require('./utils/makeHttpRequest')
const getRandomID = require('./utils/getRandomID')

/**
 * Reveals the linkage between a key held by this user and a key held by another user. In one mode, reveals all keys associated with a counterparty, in the other mode reveals only the linkage of a specific interaction. Encrypts the linkage value so that only the specified verifier can access it. Refer to [BRC-72](https://brc.dev/72) for full details.
 *
 * @param {Object} args All parameters are passed in an object.
 * @param {string} args.mode When "counterparty" it will reveal all keys for the counterparty. When "specific" it will reveal only the linkage for the specific protocolID and keyID provided
 * @param {string} args.counterparty The identity of the person who is associated with the linked key to reveal. Must be a hexadecimal string representing a 33-byte or 65-byte value.
 * @param {string} args.verifier The identity key of the person to whom this revelation is being made. The linkage will be encrypted so that only the verifier can access it.
 * @param {string} args.protocolID BRC-43 Protocol ID under which the linkage is to be revealed
 * @param {string} args.keyID BRC-43 Key ID under which the linkage is to be revealed
 * @param {string} [args.description] Describe the high-level operation being performed, so that the user can make an informed decision if permission is needed.
 * @param {Boolean} [args.privileged=false] This indicates which keyring should be used.
 *
 * @returns {Promise<object>} The revealed linkage payload, as described in [BRC-72](https://brc.dev/72).
 */
module.exports = async ({
  mode,
  counterparty,
  verifier,
  protocolID,
  keyID,
  description,
  privileged = false
}) => {
  const connection = await connectToSubstrate()
  if (connection.substrate === 'cicada-api') {
    const httpResult = await makeHttpRequest(
      'http://localhost:3301/v1/revealKeyLinkage' +
        `?protocolID=${encodeURIComponent(protocolID)}` +
        `&keyID=${encodeURIComponent(keyID)}` +
        `&privileged=${encodeURIComponent(privileged)}` +
        `&verifier=${encodeURIComponent(verifier)}` +
        `&description=${encodeURIComponent(description)}` +
        `&counterparty=${encodeURIComponent(counterparty)}` +
        `&mode=${encodeURIComponent(mode)}`,
      {
        method: 'get',
        headers: {
          'Content-Type': 'application/json'
        }
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
        call: 'revealKeyLinkage',
        params: {
          mode,
          counterparty,
          verifier,
          protocolID,
          keyID,
          description,
          privileged
        }
      }, '*')
    })
  } else if (connection.substrate === 'window-api') {
    return window.CWI.revealKeyLinkage({
      mode,
      counterparty,
      verifier,
      protocolID,
      keyID,
      description,
      privileged
    })
  } else {
    const e = new Error(`Unknown Babbage substrate: ${connection.substrate}`)
    e.code = 'ERR_UNKNOWN_SUBSTRATE'
    throw e
  }
}
