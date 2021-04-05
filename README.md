# @babbage/sdk

Build Babbage apps in JavaScript

**[API Documentation](https://github.com/p2ppsr/babbage-sdk/blob/master/API.md)**

**[NPM Package](https://www.npmjs.com/package/babbage-sdk)**

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

## License

The license for this library, which is a wrapper for the proprietary Babbage API, is the Open BSV License. It can only be used on the BSV blockchain. The Babbage API itself, including the rights to create and host Babbage software or any other related infrastructure, is not covered by the Open BSV License and remains proprietary and restricted. The Open BSV License only extends to the code in this repository, and you are not permitted to host Babbage software, servers or create copies or alternative implementations of the proprietary Babbage API without other permission.
