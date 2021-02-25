# rubeus-js

JS Wrapper for Rubeus API

## Usage

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

## License

The license for this project is the Open BSV License.
