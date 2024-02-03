const connectToSubstrate = require('./utils/connectToSubstrate')
const makeHttpRequest = require('./utils/makeHttpRequest')
const getRandomID = require('./utils/getRandomID')

/** Creates and broadcasts a BitCoin transaction with the provided inputs and outputs.
 * @param {Object} obj All parameters for this function are provided in an object
 * @param {Object} [obj.inputs] Input scripts to spend as part of this Action. This is an object whose keys are TXIDs and whose values are [BRC-8](https://brc.dev/8) transaction envelopes that contain an additional field called `outputsToRedeen`. This additional field is an array of objects, each containing `index` and `unlockingScript` properties (with an optional `sequenceNumber`). The `index` property is the output number in the transaction you are spending, and `unlockingScript` is the hex-encoded Bitcoin script that unlocks and spends the output (the `sequenceNumber` is applied to the input). Any signatures should be created with `SIGHASH_NONE | ANYONECANPAY` so that additional modifications to the resulting transaction can be made afterward without invalidating them. You may substitute `SIGHASH_NONE` for `SIGHASH_SINGLE` if required for a token contract, or drop `ANYONECANPAY` if you are self-funding the Action and the outputs require no other funding inputs.
 * @param {Array<Object>} [obj.outputs] The array of transaction outputs (amounts and scripts) that you want in the transaction. Each object contains "satoshis" and "script", which can be any custom locking script of your choosing.
 * @param {Number} [obj.lockTime] The lock time of the created transaction.
 * @param {string} obj.description A present-tense description of the user Action being facilitated or represented by this BitCoin transaction.
 * @param {Array<String>} obj.labels An array of transaction labels to apply to the Action
 * @param {Boolean} [obj.acceptDelayedBroadcast=true] If true, self-signs initial validation response, watchman handles broadcast and proof verification.
 * Outputs are immediately available to following transactions using the same mode.
 * If false, waits for broadcast to transaction processing network response. Throws an error if not accepted by at least one processor.
 * Recommended mode for situations in which a double spend is possible.
 * @returns {Promise<Object>} An Action object containing "txid", "rawTx" "mapiResponses" and "inputs".
 */
module.exports = async ({
  inputs,
  outputs,
  lockTime,
  description,
  labels,
  acceptDelayedBroadcast = true
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
          lockTime,
          description,
          labels,
          acceptDelayedBroadcast
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
        call: 'createAction',
        params: {
          inputs,
          outputs,
          lockTime,
          description,
          labels,
          acceptDelayedBroadcast
        }
      }, '*')
    })
  } else if (connection.substrate === 'window-api') {
    return window.CWI.createAction({
      inputs,
      outputs,
      lockTime,
      description,
      labels,
      acceptDelayedBroadcast
    })
  } else {
    const e = new Error(`Unknown Babbage substrate: ${connection.substrate}`)
    e.code = 'ERR_UNKNOWN_SUBSTRATE'
    throw e
  }
}
