module.exports = {
  createAction: require('./createAction'),
  createHmac: require('./createHmac'),
  createSignature: require('./createSignature'),
  decrypt: require('./decrypt'),
  encrypt: require('./encrypt'),
  getPublicKey: require('./getPublicKey'),
  getVersion: require('./getVersion'),
  isAuthenticated: require('./isAuthenticated'),
  verifyHmac: require('./verifyHmac'),
  verifySignature: require('./verifySignature'),
  waitForAuthentication: require('./waitForAuthentication'),
  createCertificate: require('./createCertificate'),
  getCertificates: require('./getCertificates'),
  proveCertificate: require('./proveCertificate'),
  submitDirectTransaction: require('./submitDirectTransaction'),
  getTransactionOutputs: require('./getTransactionOutputs')
}
