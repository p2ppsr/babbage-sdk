# rubeus-js

JS Wrapper for Rubeus API

## Overview

This library provides a client-side authentication solution that will let your application access a few 
cryptographic keys that belong to your users. You can use these for client-side encryption/decryption, 
authentication, signing, or even creating Bitcoin transactions.

### Data Ownership

Traditionally, internet-based businesses have owned all their users' data. They use this data for advertising, 
analytics, tracking and many other purposes. This library enables a new model—a model in which the users 
themselves remain the sole owners and custodians of the data they generate with your application. The same user will always have the same set of keys, even if they recover their account or 
log in on a new device:

Key Name            | Description
--------------------|-----------------------
Primary Key         | Use this key for low-security symmetric cryptography
Privileged Key      | Use this key for high-security symmetric cryptography
Primary Signing     | Use this key for low-security asymmetric cryptography and ECDH with other users
Privileged Signing  | Use this key for high-security asymmetric cryptography and ECDH with other users

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

## API

You can use this package inside the browser or in NodeJS applications.

## createHmac

Creates an HMAC on data with a key belonging to the user. Also allows an HMAC to be created with the asymmetric keys between two users with an ECDH shared secret.

### Parameters

-   `args` **[object][46]** All parameters are passed in an object
    -   `args.data` **([String][43] \| [Uint8Array][47])** The data to HMAC
    -   `args.key` **[string][43]** Specify the key tree to use. Available key trees are `primaryKey`, `privilegedKey`, `primarySigning`, and `privilegedSigning`
    -   `args.path` **[string][43]** Specify the derivation path to the key to use
    -   `args.pub` **([Uint8Array][47] \| [Object][46])?** If using `primarySigning` or `privilegedSigning`, specify the foreign public key to use when deriving the ECDH shared secret. The HMAC will be created with the shared secret key.
    -   `args.reason` **[string][43]?** If using `privilegedKey` or `privilegedSigning`, specify the reason for performing this operation
    -   `args.pubFormat` **[string][43]** The format of the foreign public key. Can be "raw", "spki" or "jwk" (optional, default `raw`)


-   Throws **ValidationError** Invalid key, the key must be `primaryKey`, `privilegedKey`, `primarySigning`, or `privilegedSigning`
-   Throws **ValidationError** No public key provided when using ECDH with `primarySigning` or `privilegedSigning`

Returns **[Promise][44]&lt;[Uint8Array][47]>** The HMAC value

## getPrimarySigningPub

Returns one of the keys from the primary signing public key tree

### Parameters

-   `obj` **[object][46]** Parameters to this function are given in an object (optional, default `{}`)
    -   `obj.path` **[string][43]** The derivation path of the key to return
    -   `obj.format` **[string][43]** The desired [KeeTree Format][48] of the returned key (optional, default `'string'`)
    -   `obj.formatOptions` **[object][46]** The options for the specified [KeeTree Format][48] (optional, default `{}`)


-   Throws **InvalidStateError** Library not initialized or no user is currently authenticated

Returns **[Promise][44]&lt;([String][43] | CryptoKey | [Uint8Array][47])>** The specified key in the specified format

## createSignature

Creates a cryptographic signature with a key belonging to the user. The SHA-256 hash is used with ECDSA.

### Parameters

-   `args` **[object][46]** All parameters are passed in an object
    -   `args.data` **([Uint8Array][47] \| [ArrayBuffer][49])** The data to sign
    -   `args.key` **[string][43]** Specify the key tree to use. Available key trees are `primarySigning` and `privilegedSigning`
    -   `args.path` **[string][43]** Specify the derivation path to the key to use
    -   `args.reason` **[string][43]?** If using `privilegedSigning`, specify the reason for performing this operation


-   Throws **ValidationError** Invalid key, the key must be `primarySigning` or `privilegedSigning`

Returns **[Promise][44]&lt;[Uint8Array][47]>** The ECDSA message signature

## getPrivilegedSigningPub

Returns one of the keys from the privileged signing public key tree

### Parameters

-   `obj` **[object][46]** Parameters to this function are given in an object (optional, default `{}`)
    -   `obj.path` **[string][43]** The derivation path of the key to return
    -   `obj.reason` **[string][43]** Your reason for accessing the privileged signing public key
    -   `obj.format` **[string][43]** The desired [KeeTree Format][48] of the returned key (optional, default `'string'`)
    -   `obj.formatOptions` **[object][46]** The options for the specified [KeeTree Format][48] (optional, default `{}`)


-   Throws **InvalidStateError** Library not initialized or no user is currently authenticated

Returns **[Promise][44]&lt;([String][43] | CryptoKey | [Uint8Array][47])>** The specified key in the specified format

## decrypt

Decrypts data with a key belonging to the user. Also allows data to be decrypted with the asymmetric keys between two users with an ECDH shared secret.

### Parameters

-   `args` **[object][46]** All parameters are passed in an object (optional, default `{}`)
    -   `args.ciphertext` **([string][43] \| [Uint8Array][47])** The data to decrypt
    -   `args.key` **[string][43]** Specify the key tree to use. Available key trees are `primaryKey`, `privilegedKey`, `primarySigning`, and `privilegedSigning`
    -   `args.path` **[string][43]** Specify the path on the given key tree to use.
    -   `args.pub` **([Uint8Array][47] \| [Object][46])?** If using `primarySigning` or `privilegedSigning`, specify the foreign public key to use when deriving the ECDH shared secret. The data will be decrypted with the ECDH shared secret key between the user's private key and the given public key.
    -   `args.returnType` **[string][43]** Specify the data type for the returned plaintext. Available types are `string` and `Uint8Array` (optional, default `string`)
    -   `args.reason` **[string][43]?** If using `privilegedKey` or `privilegedSigning`, specify the reason for performing this operation
    -   `args.pubFormat` **[string][43]** Specify the format of the provided foreign public key. Acceptable formats are "raw" (der), "spki", or "jwk" (optional, default `raw`)


-   Throws **ValidationError** Invalid key, the key must be `primaryKey`, `privilegedKey`, `primarySigning`, or `privilegedSigning`
-   Throws **ValidationError** No foreign public key provided when using ECDH with `primarySigning` or `privilegedSigning`

Returns **[Promise][44]&lt;([String][43] \| [Uint8Array][47])>** The decrypted plaintext

## encrypt

Encrypts data with a key belonging to the user. Also allows data to be encrypted with the asymmetric keys between two users with an ECDH shared secret.

### Parameters

-   `args` **[object][46]** All parameters are passed in an object (optional, default `{}`)
    -   `args.data` **([string][43] \| [Uint8Array][47])** The data to encrypt
    -   `args.key` **[string][43]** Specify the key tree to use. Available key trees are `primaryKey`, `privilegedKey`, `primarySigning`, and `privilegedSigning`
    -   `args.path` **[string][43]** Specify the path on the given key tree to use.
    -   `args.pub` **([Uint8Array][47] \| [Object][46])?** If using `primarySigning` or `privilegedSigning`, specify the foreign public key to use when deriving the ECDH shared secret. The data will be encrypted with the ECDH shared secret key between the user's private key and the given public key.
    -   `args.returnType` **[string][43]** Specify the data type for the returned ciphertext. Available types are `string` and `Uint8Array` (optional, default `string`)
    -   `args.reason` **[string][43]?** If using `privilegedKey` or `privilegedSigning`, specify the reason for performing this operation
    -   `args.pubFormat` **[string][43]** Specify the format of the provided foreign public key. Acceptable formats are "raw" (der), "spki", or "jwk" (optional, default `raw`)


-   Throws **ValidationError** Invalid key, the key must be `primaryKey`, `privilegedKey`, `primarySigning`, or `privilegedSigning`
-   Throws **ValidationError** No foreign public key provided when using ECDH with `primarySigning` or `privilegedSigning`

Returns **[Promise][44]&lt;([String][43] \| [Uint8Array][47])>** The encrypted ciphertext

## isAuthenticated

Checks if a user is currently authenticated.

Returns **[boolean][45]** Indicating whether a user is currently authenticated.

## waitForAuthentication

Waits for a user to be authenticated.

Returns **[Promise][44]&lt;([boolean][45])>** That resolves with true once a user has authenticated.

## sendDataTransaction

This function allows you to broadcast transactions to the BSV blockchain. It allows inputs to be created that are signed with the keys from the signing trees, as well as any other custom key you may provide. R-puzzle is used to achieve valid input signatures.

If more funds are needed in the user account, onPaymentRequired events are raised.

### Parameters

-   `obj` **[Object][46]** All parameters for this function are provided in an object
    -   `obj.data` **[Array][52]&lt;([String][43] \| [Uint8Array][47])>** The array of PUSHDATA fields to include in the OP_RETURN output. Each element of the PUSHDATA array may be a String or a Uint8Array
    -   `obj.reason` **[String][43]** Your reason for sending a transaction on behalf of this CWI user (optional, default `'A third party is requesting to send data on your behalf without providing a reason.'`)
    -   `obj.senderWIF` **[String][43]?** The WIF string of a custom key to use for input signing. This will be used in place of keyName and keyPath if it is provided.
    -   `obj.keyName` **[string][43]** The name of one of the signing key trees to use for input signing (valid options are "primarySigning" and "privilegedSigning"). (optional, default `primarySigning`)
    -   `obj.keyPath` **[string][43]** The derivation path on the key tree for the key to use to sign inputs (optional, default `m/1033/1`)
    -   `obj._recursionCounter`   (optional, default `0`)
    -   `obj._lastRecursionError`  


-   Throws **InvalidStateError** Library not initialized or no user is currently authenticated

Returns **[Promise][44]&lt;[String][43]>** The TXID string of the broadcasted transaction.

## ninja

This is a wrapper around the implementation of [UTXO Ninja](https://github.com/p2ppsr/utxoninja) used by Rubeus.

The documentation for this ninja object is the same as the documentation for the UTXO Ninja library. The only differences are that you do not provide the xprivKey or config objects to these functions, as those are automatically injected by the wrapper.

Only the following functions are exported:
- getPaymail
- getAvatar
- getTransactionWithOutputs
- processOutgoingTransaction

## License

The license for this library, which is a wrapper for the proprietary Rubeus API, is the Open BSV License. It can only be used on the BSV blockchain. The Rubeus API itself, including the rights to create and host Rubeus software or any other related infrastructure, is not covered by the Open BSV License and remains proprietary and restricted. The Open BSV License only extends to the code in this repository, and you are not permitted to host Rubeus software, servers or create copies or alternative implementations of the proprietary Rubeus API without other permission.
