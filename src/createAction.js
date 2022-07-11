const fetch =
  typeof window === 'object'
    ? window.fetch
    : require('isomorphic-fetch')
module.exports = async ({inputs, outputs, bridges, labels}) => {
  const result = await fetch(
     `http://localhost:3301/v1/createAction`,
    {
      method: 'post',
      headers: {
        'Origin': 'http://localhost',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs,
        outputs,
        bridges,
        labels
      })
    }
  )
  return result.json()
}
