const connectToSubstrate = require('./utils/connectToSubstrate')
const makeHttpRequest = require('./utils/makeHttpRequest')

/** Creates and broadcasts a BitCoin transaction with the provided inputs and outputs.
 * @param {Object} obj All parameters for this function are provided in an object
 * @param {Object} [obj.inputs] Input scripts to spend as part of this Action. This is an object whose keys are TXIDs and whose values are Everett-style transaction envelopes that contain an additional field called `outputsToRedeen`. This additional field is an array of objects, each containing `index` and `unlockingScript` properties. The `index` property is the output number in the transaction you are spending, and `unlockingScript` is the hex-encoded Bitcoin script that unlocks and spends the output. Any signatures should be created with `SIGHASH_NONE | ANYONECANPAY` so that additional modifications to the resulting transaction can be made afterward without invalidating them. You may substitute `SIGHASH_NONE` for `SIGHASH_SINGLE` if required for a token contract, or drop `ANYONECANPAY` if you are self-funding the Action.
 * @param {Array<Object>} [obj.outputs] The array of transaction outputs (amounts and scripts) that you want in the transaction. Each object contains "satoshis" and "script", which can be any custom locking script of your choosing.
 * @param {string} obj.description A present-tense description of the user Action being facilitated or represented by this BitCoin transaction.
 * @param {Array<String>} [obj.bridges=[]] Bridgeport bridges to notify about this Action.
 * @param {Array<String>} [obj.labels=[]] Labels to apply to this Action.
 * @returns {Promise<Object>} An Action object containing "txid", "rawTx" "mapiResponses" and "inputs".
 */
module.exports = async ({
  inputs,
  outputs,
  description,
  bridges,
  labels
}) => {
  const connection = await connectToSubstrate()
  if (connection.substrate === 'cicada-api') {
    const httpResult = await makeHttpRequest(
      'http://localhost:3301/v1/createAction',
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs,
          outputs,
          description,
          bridges,
          labels
        })
      }
    )
    return httpResult
  } else if (connection.substrate === 'babbage-xdm') {
    return new Promise((resolve, reject) => {
      const id = Buffer.from(require('crypto').randomBytes(8)).toString('base64')
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
        call: 'createAction',
        params: {
          inputs,
          outputs,
          description,
          bridges,
          labels
        }
      }, '*')
    })
  } else if (connection.substrate === 'window-api') {
    return window.CWI.createAction({
      inputs,
      outputs,
      description,
      bridges,
      labels
    })
  } else {
    const e = new Error(`Unknown Babbage substrate: ${connection.substrate}`)
    e.code = 'ERR_UNKNOWN_SUBSTRATE'
    throw e
  }
}
