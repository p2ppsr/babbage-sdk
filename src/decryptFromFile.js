const { createReadStream, createWriteStream } = require('fs')
const { Transform } = require('stream')
const decrypt = require('./decrypt')
/**
 * Decrypts large file data with a key belonging to the user. The same protocolID, keyID, counterparty and privileged parameters that were used during encryption must be used to successfully decrypt.
 *
 * @param {Object} args All parameters are passed in an object.
 * @param {string} args.ciphertextFilePath A localpath to the ciphertext data file.
 * @param {string} args.destinationFilePath A localpath to save the encrypted data to.
 * @param {string} args.protocolID Specify an identifier for the protocol under which this operation is being performed. It should be the same protocol ID used during encryption.
 * @param {string} args.keyID This should be the same message ID used during encryption.
 * @param {string} [args.description] Describe the high-level operation being performed, so that the user can make an informed decision if permission is needed.
 * @param {Uint8Array|string} [args.counterparty=self] If a foreign user used the local user's identity key as a counterparty when encrypting a message, specify the foreign user's identity key and the message can be decrypted. Must be a hexadecimal string representing a 33-byte or 65-byte value, "self" or "anyone".
 * @param {Boolean} [args.privileged=false] This indicates which keyring should be used when decrypting. Use the same value as was used during encryption.
 * @param {string} [args.returnType=Uint8Array] Specify the data type for the returned plaintext. Available types are `string` (binary) and `Uint8Array`.
 *
 * @returns {Promise<string|Uint8Array>} The decrypted plaintext.
 */
const CHUNK_SIZE = 2621440 // TODO: figure out chunk size
module.exports = async ({
  ciphertextFilePath,
  destinationFilePath,
  protocolID,
  keyID,
  description = '',
  counterparty = 'self',
  privileged = false,
  returnType = 'Uint8Array'
}) => {
  const rstream = createReadStream(ciphertextFilePath, { highWaterMark: CHUNK_SIZE })
  const wstream = createWriteStream(destinationFilePath)

  // Transforms the encrypted input data by decrypting each chunk
  const decryptTransform = new Transform({
    async transform (chunk, encoding, callback) {
      console.log(chunk)
      callback(null, Buffer.from((await decrypt({
        ciphertext: Buffer.from(chunk),
        protocolID,
        keyID,
        description,
        counterparty,
        privileged,
        returnType
      }))))
    }
  })

  // Pipe the input data through the decryption transform and to the output stream
  rstream.pipe(decryptTransform).pipe(wstream).on('finish', () => {
    console.log('done decrypting')
    return JSON.stringify({
      status: '200',
      result: 'success'
    })
  })
  return JSON.stringify({
    status: '400',
    result: 'error?'
  })
}
