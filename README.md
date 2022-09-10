# @babbage/sdk

Build Babbage apps in JavaScript

**[NPM Package](https://www.npmjs.com/package/@babbage/sdk)**

## Introduction

This library provides a client-side authentication solution that will let your application access a few
cryptographic keys that belong to your users. You can use these for client-side encryption/decryption,
authentication, signing, or even creating Bitcoin transactions.

### Data Ownership

Traditionally, internet-based businesses have owned all their users' data. They use this data for advertising,
analytics, tracking and many other purposes. This library enables a new model—a model in which the users
themselves remain the sole owners and custodians of the data they generate with your application. The same user will always have the same set of keys, even if they recover their account or
log in on a new device:

Key Name            | Description
\--------------------|-----------------------
Primary Key         | Use this key for low-security symmetric cryptography
Privileged Key      | Use this key for high-security symmetric cryptography

### One Set of Keys per User

Each user has one set of keys. Their keys can be used only on their devices and only with their permission.
Generally, all of a user's applications will share a common set of keys. This makes it possible for multiple
applications to access the same sets of data. For example, two competing Twetch UIs could compete in
representing the same pieces of content.

### No Server-side Access to Keys

We take steps to protect the security of user keys, in an attempt to ensure that they are not exported or extracted. While
it's not technologically impossible to steal a user's keys and send them to your servers, since you do not own
the keys, exceeding your authorized level of access is a violation of the law in most countries.

### Monetization

How, then, are you to make money with your applications? When user data is encrypted and inaccessible,
traditional ad-based monetization techniques don't work. We envision a new era of micropayment-based
monetization schemes powered by a world-scale blockchain such as BSV. You could, for example, sell access to
your API for 1000 satoshis per request. Ad-free video sharing platforms could charge $0.0001 per minute of
video played, sending 80% to the creator of the video and 20% to the platform's owners. A music streaming
service could charge $0.05 per song, splitting each payment in a similar way.

### PKI-based User Certification

Since a set of keys is tied directly to a user, they can get their keys endorsed by well-known public
certificate authorities. For example, if MIT signed off whenever someone got a degree, you could trivially
implement a social network exclusively for MIT graduates.

### Differences between Primary and Privileged Keysets

The primary keyset and the privileged keyset have the same properties, except that the privileged keyset is for
use in more secure contexts. For example, if implementing a secure messaging application, the primary keyset
should generally be used for most communications. When sending something like a "secret chat" or a "confidential attachment",
the privileged keyset should be used to encrypt/decrypt or sign/verify the data.

### Access to the Privileged keyset

You can access `privilegedKey` and `privilegedSigning` with the functions defined in the API section below. If
they haven't been accessed for more than the length of time defined by `privilegedKeyTimeout`, the
user will need to enter their password in order to unlock the key. Therefore, the promises returned by
functions that make use of privileged keysets may take 30+ seconds to resolve while the user enters their
password.

## Installation

    npm i @babbage/sdk

## Example Usage

```js
const { encrypt, decrypt } = require('@babbage/sdk')

// Encrypt and decrypt data using the BabbageSDK
const encryptedData = await encrypt({
    plaintext: Buffer.from('some data'),
    protocolID: 'Hello World',
    keyID: '1',
  })
const decryptedData = await decrypt({
    ciphertext: encryptedData,
    protocolID: 'Hello World',
    keyID: '1',
    returnType: 'string'
  })
```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

*   [createAction](#createaction)
    *   [Parameters](#parameters)
*   [createHmac](#createhmac)
    *   [Parameters](#parameters-1)
*   [createSignature](#createsignature)
    *   [Parameters](#parameters-2)
*   [decrypt](#decrypt)
    *   [Parameters](#parameters-3)
*   [encrypt](#encrypt)
    *   [Parameters](#parameters-4)
*   [getPublicKey](#getpublickey)
    *   [Parameters](#parameters-5)
*   [getVersion](#getversion)
*   [isAuthenticated](#isauthenticated)
*   [verifyHmac](#verifyhmac)
    *   [Parameters](#parameters-6)
*   [verifySignature](#verifysignature)
    *   [Parameters](#parameters-7)
*   [waitForAuthentication](#waitforauthentication)
*   [getCertificates](#getcertificates)
    *   [Parameters](#parameters-8)

### createAction

Creates and broadcasts a BitCoin transaction with the provided inputs and outputs.

#### Parameters

*   `obj` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** All parameters for this function are provided in an object

    *   `obj.inputs` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** Input scripts to spend as part of this Action. This is an object whose keys are TXIDs and whose values are Everett-style transaction envelopes that contain an additional field called `outputsToRedeen`. This additional field is an array of objects, each containing `index` and `unlockingScript` properties. The `index` property is the output number in the transaction you are spending, and `unlockingScript` is the hex-encoded Bitcoin script that unlocks and spends the output. Any signatures should be created with `SIGHASH_NONE | ANYONECANPAY` so that additional modifications to the resulting transaction can be made afterward without invalidating them. You may substitute `SIGHASH_NONE` for `SIGHASH_SINGLE` if required for a token contract, or drop `ANYONECANPAY` if you are self-funding the Action.
    *   `obj.outputs` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>?** The array of transaction outputs (amounts and scripts) that you want in the transaction. Each object contains "satoshis" and "script", which can be any custom locking script of your choosing.
    *   `obj.description` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** A present-tense description of the user Action being facilitated or represented by this BitCoin transaction.
    *   `obj.bridges` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)<[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>** Bridgeport bridges to notify about this Action. (optional, default `[]`)
    *   `obj.labels` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)<[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>** Labels to apply to this Action. (optional, default `[]`)

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>** An Action object containing "txid", "rawTx" "mapiResponses" and "inputs".

### createHmac

Creates a SHA-256 HMAC with a key belonging to the user.

#### Parameters

*   `args` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** All parameters are passed in an object.

    *   `args.data` **([Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** The data to HMAC. If given as a string, it must be in base64 format.
    *   `args.protocolID` **([Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** Specify an identifier for the protocol under which this operation is being performed.
    *   `args.keyID` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** An identifier for the message. During verification, the same message ID will be required. This can be used to prevent key re-use, even when the same user is using the same protocol to HMAC multiple messages.
    *   `args.description` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Describe the high-level operation being performed, so that the user can make an informed decision if permission is needed. (optional, default `''`)
    *   `args.counterparty` **([Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** If specified, the user with this identity key will also be able to verify the HMAC, as long as they specify the current user's identity key as their counterparty. Must be a hexadecimal string representing a 33-byte or 65-byte value, "self" or "anyone". (optional, default `self`)
    *   `args.privileged` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** This indicates whether the privileged keyring should be used for the HMAC, as opposed to the primary keyring. (optional, default `false`)

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)>** The SHA-256 HMAC of the data.

### createSignature

Creates a digital signature with a key belonging to the user. The SHA-256 hash of the data is used with ECDSA.

To allow other users to externally verify the signature, use getPublicKey with the same protocolID, keyID and privileged parameters. The signature should be valid under that public key.

#### Parameters

*   `args` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** All parameters are passed in an object.

    *   `args.data` **([Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** The data to sign. If given as a string, it must be in base64 format.
    *   `args.protocolID` **([Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** Specify an identifier for the protocol under which this operation is being performed.
    *   `args.keyID` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** An identifier for the message being signed. During verification, or when retrieving the public key used, the same message ID will be required. This can be used to prevent key re-use, even when the same user is using the same protocol to sign multiple messages.
    *   `args.description` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Describe the high-level operation being performed, so that the user can make an informed decision if permission is needed. (optional, default `''`)
    *   `args.counterparty` **([Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** If specified, the user with this identity key will also be able to verify the signature, as long as they specify the current user's identity key as their counterparty. Must be a hexadecimal string representing a 33-byte or 65-byte value, "self" or "anyone". (optional, default `self`)
    *   `args.privileged` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** This indicates whether the privileged keyring should be used for signing, as opposed to the primary keyring. (optional, default `false`)

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)>** The ECDSA message signature.

### decrypt

Decrypts data with a key belonging to the user. The same protocolID, keyID, counterparty and privileged parameters that were used during encryption must be used to successfully decrypt.

#### Parameters

*   `args` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** All parameters are passed in an object.

    *   `args.ciphertext` **([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | [Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array))** The encrypted data to decipher. If given as a string, it must be in base64 format.
    *   `args.protocolID` **([Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** Specify an identifier for the protocol under which this operation is being performed. It should be the same protocol ID used during encryption.
    *   `args.keyID` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** This should be the same message ID used during encryption.
    *   `args.description` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Describe the high-level operation being performed, so that the user can make an informed decision if permission is needed. (optional, default `''`)
    *   `args.counterparty` **([Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** If a foreign user used the local user's identity key as a counterparty when encrypting a message, specify the foreign user's identity key and the message can be decrypted. Must be a hexadecimal string representing a 33-byte or 65-byte value, "self" or "anyone". (optional, default `self`)
    *   `args.privileged` **[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** This indicates which keyring should be used when decrypting. Use the same value as was used during encryption. (optional, default `false`)
    *   `args.returnType` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Specify the data type for the returned plaintext. Available types are `string` (binary) and `Uint8Array`. (optional, default `Uint8Array`)

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | [Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array))>** The decrypted plaintext.

### encrypt

Encrypts data with a key belonging to the user. If a counterparty is provided, also allows the counterparty to decrypt the data. The same protocolID, keyID, counterparty and privileged parameters must be used when decrypting.

#### Parameters

*   `args` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** All parameters are passed in an object.

    *   `args.plaintext` **([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | [Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array))** The data to encrypt. If given as a string, it must be in base64 format.
    *   `args.protocolID` **([Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** Specify an identifier for the protocol under which this operation is being performed.
    *   `args.keyID` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** An identifier for the message being encrypted. When decrypting, the same message ID will be required. This can be used to prevent key re-use, even when the same two users are using the same protocol to encrypt multiple messages. It can be randomly-generated, sequential, or even fixed.
    *   `args.description` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Describe the high-level operation being performed, so that the user can make an informed decision if permission is needed. (optional, default `''`)
    *   `args.counterparty` **([Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** If specified, the user with this identity key will also be able to decrypt the message, as long as they specify the current user's identity key as their counterparty. Must be a hexadecimal string representing a 33-byte or 65-byte value, "self" or "anyone". (optional, default `self`)
    *   `args.privileged` **[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** When true, the data will be encrypted with the user's privileged keyring instead of their primary keyring. (optional, default `false`)
    *   `args.returnType` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Specify the data type for the returned ciphertext. Available types are `string` (binary) and `Uint8Array`. (optional, default `Uint8Array`)

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | [Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array))>** The encrypted ciphertext.

### getPublicKey

Returns the public key. If identityKey is specified, returns the current user's identity key. If a counterparty is specified, derives a public key for the counterparty.

#### Parameters

*   `args` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** All parameters are passed in an object.

    *   `args.protocolID` **([Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))?** Specify an identifier for the protocol under which this operation is being performed.
    *   `args.keyID` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** An identifier for retrieving the public key used. This can be used to prevent key re-use, even when the same user is using the same protocol to perform actions.
    *   `args.privileged` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** This indicates whether the privileged keyring should be used, as opposed to the primary keyring. (optional, default `false`)
    *   `args.identityKey` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** If true, the identity key will be returned, and no key derivation will be performed (optional, default `false`)
    *   `args.reason` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** The reason for requiring access to the user's privilegedKey (optional, default `'No reason provided.'`)
    *   `args.counterparty` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The counterparty to use for derivation. If provided, derives a public key for this counterparty, who can derive the corresponding private key. (optional, default `self`)
    *   `args.description` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Describe the high-level operation being performed, so that the user can make an informed decision if permission is needed.

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>** An object containing the user's public key

### getVersion

Returns the current version of the kernal

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>** An object containing the current version as a string

### isAuthenticated

Checks if a user is currently authenticated.

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>** Returns an object indicating whether a user is currently authenticated.

### verifyHmac

Verifies that a SHA-256 HMAC was created with a key that belongs to the user.

#### Parameters

*   `args` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** All parameters are passed in an object.

    *   `args.data` **([Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** The data to verify. If given as a string, it must be in base64 format.
    *   `args.hmac` **([Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** The hmac created from the data. If given as a string, it must be in base64 format.
    *   `args.protocolID` **([Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** Specify an identifier for the protocol under which the HMAC operation was performed.
    *   `args.keyID` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** An identifier for the message. This should be the same message ID that was used when creating the HMAC.
    *   `args.description` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Describe the high-level operation being performed, so that the user can make an informed decision if permission is needed. (optional, default `''`)
    *   `args.counterparty` **([Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** If specified, allows verification where the user with this identity key has created the HMAC, as long as they had specified the current user's identity key as their counterparty during creation. Must be a hexadecimal string representing a 33-byte or 65-byte value or "self". Note that signatures created with counterparty = "anyone" are verifiable by anyone, and do not need user keys through the kernel. (optional, default `self`)
    *   `args.privileged` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** This indicates whether the privileged keyring was used for the HMAC, as opposed to the primary keyring. (optional, default `false`)

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)>** Whether the HMAC has been erified.

### verifySignature

Verifies that a digital signature was created with a key belonging to the user.

#### Parameters

*   `args` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** All parameters are passed in an object.

    *   `args.data` **([Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** The data that was signed. If given as a string, it must be in base64 format.
    *   `args.signature` **([Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** The signature to verify, in the same format returned when it was created.
    *   `args.protocolID` **([Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** Specify the identifier for the protocol under which the data was signed.
    *   `args.keyID` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** An identifier for the message that was signed. This should be the same message ID that was used when creating the signature.
    *   `args.description` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Describe the high-level operation being performed, so that the user can make an informed decision if permission is needed. (optional, default `''`)
    *   `args.counterparty` **([Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** If specified, allows verification where the user with this identity key has created the signature, as long as they had specified the current user's identity key as their counterparty during creation. Must be a hexadecimal string representing a 33-byte or 65-byte value or "self". Note that signatures created with counterparty = "anyone" are verifiable by anyone, and do not need user keys through the kernel. (optional, default `self`)
    *   `args.privileged` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** This indicates whether the privileged keyring was used for signing, as opposed to the primary keyring. (optional, default `false`)
    *   `args.reason` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** The reason shown to the user for using the privileged key (optional, default `''`)

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>** An object indicating whether the signature was successfully verified.

### waitForAuthentication

Waits for a user to be authenticated.

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>** An object containing a boolean indicating that a user is authenticated

### getCertificates

Returns found certificates

#### Parameters

*   `certifiers` **any** The certifiers to filter certificates by
*   `types` **any** The certificate types to filter certificates by

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>** An object containing the found certificates

## License

The license for this library, which is a wrapper for the proprietary Babbage API, is the Open BSV License. It can only be used on the BSV blockchain. The Babbage API itself, including the rights to create and host Babbage software or any other related infrastructure, is not covered by the Open BSV License and remains proprietary and restricted. The Open BSV License only extends to the code in this repository, and you are not permitted to host Babbage software, servers or create copies or alternative implementations of the proprietary Babbage API without other permission.
