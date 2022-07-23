const { createReadStream, createWriteStream } = require('fs')
const { Transform } = require('stream')
const encrypt = require('./encrypt')
/**
 * Encrypts large file data with a key belonging to the user. If a counterparty is provided, also allows the counterparty to decrypt the data. The same protocolID, keyID, counterparty and privileged parameters must be used when decrypting.
 *
 * @param {Object} args All parameters are passed in an object.
 * @param {string} args.plaintextFilePath A localpath to the plaintext file.
 * * @param {string} args.destinationFilePath A localpath to save the encrypted data to.
 * @param {string} args.protocolID Specify an identifier for the protocol under which this operation is being performed.
 * @param {string} args.keyID An identifier for the message being encrypted. When decrypting, the same message ID will be required. This can be used to prevent key re-use, even when the same two users are using the same protocol to encrypt multiple messages. It can be randomly-generated, sequential, or even fixed.
 * @param {string} [args.description] Describe the high-level operation being performed, so that the user can make an informed decision if permission is needed.
 * @param {Uint8Array|string} [args.counterparty=self] If specified, the user with this identity key will also be able to decrypt the message, as long as they specify the current user's identity key as their counterparty. Must be a hexadecimal string representing a 33-byte or 65-byte value, "self" or "anyone".
 * @param {Boolean} [args.privileged=false] When true, the data will be encrypted with the user's privileged keyring instead of their primary keyring.
 * @param {string} [args.returnType=Uint8Array] Specify the data type for the returned ciphertext. Available types are `string` (binary) and `Uint8Array`.
 *
 * @returns {Promise<string|Uint8Array>} The encrypted ciphertext.
 */
const CHUNK_SIZE = 2621392 // TODO: figure out chunk size
module.exports = async ({
  plaintextFilePath,
  destinationFilePath,
  protocolID,
  keyID,
  description = '',
  counterparty = 'self',
  privileged = false,
  returnType = 'Uint8Array'
}) => {
  const rstream = createReadStream(plaintextFilePath, { highWaterMark: CHUNK_SIZE })
  const wstream = createWriteStream(destinationFilePath)

  // Transforms the plaintext input data by encrypting each chunk
  const encryptTransform = new Transform({
    async transform (chunk, encoding, callback) {
      console.log(chunk)
      callback(null, Buffer.from((await encrypt({
        plaintext: Buffer.from(chunk),
        protocolID,
        keyID,
        description,
        counterparty,
        privileged,
        returnType
      }))))
    }
  })
  // Pipe the input data through the encryption transform and to the output stream
  rstream.pipe(encryptTransform).pipe(wstream).on('finish', () => {
    console.log('done encrypting')
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
