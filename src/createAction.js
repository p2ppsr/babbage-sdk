const fetch =
  typeof window === 'object'
    ? window.fetch
    : require('isomorphic-fetch')

/** Creates and broadcasts a BitCoin transaction with the provided inputs and outputs.
 * @param {Object} obj All parameters for this function are provided in an object
 * @param {Object} [obj.inputs] Input scripts to spend as part of this Action. This is an object whose keys are TXIDs and whose values are Everett-style transaction envelopes that contain an additional field called `outputsToRedeen`. This additional field is an array of objects, each containing `index` and `unlockingScript` properties. The `index` property is the output number in the transaction you are spending, and `unlockingScript` is the hex-encoded Bitcoin script that unlocks and spends the output. Any signatures should be created with `SIGHASH_NONE | ANYONECANPAY` so that additional modifications to the resulting transaction can be made afterward without invalidating them. You may substitute `SIGHASH_NONE` for `SIGHASH_SINGLE` if required for a token contract, or drop `ANYONECANPAY` if you are self-funding the Action.
 * @param {Array<Object>} [obj.outputs] The array of transaction outputs (amounts and scripts) that you want in the transaction. Each object contains "satoshis" and "script", which can be any custom locking script of your choosing.
 * @param {string} obj.description A present-tense description of the user Action being facilitated or represented by this BitCoin transaction.
 * @param {Array<String>} [obj.bridges=[]] Bridgeport bridges to notify about this Action.
 * @param {Array<String>} [obj.labels=[]] Labels to apply to this Action.
 * @param {string} args.originator The domain name of the application that is calling this function.
 * @returns {Promise<Object>} An Action object containing "txid", "rawTx" "mapiResponses" and "inputs".
 */
module.exports = async ({
  inputs, 
  outputs, 
  description,
  bridges, 
  labels
}) => {
  const result = await fetch(
     `http://localhost:3301/v1/createAction`,
    {
      method: 'POST',
      headers: {
        'Origin': 'http://localhost',
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
  return result.json()
}
