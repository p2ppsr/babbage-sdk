const fetch =
  typeof window === 'object'
    ? window.fetch
    : require('isomorphic-fetch')
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
