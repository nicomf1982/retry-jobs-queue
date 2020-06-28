var { getConnection } = require('./channel')

async function prod () {
  const channel = await getConnection()
  let id = 1
  setInterval(() => {
    const msg = {
      id: id++,
      status: 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    channel.publish('workExchange', '', encode(msg))
  },1000)
  
}
prod()

function encode(doc) {
  return Buffer.from(JSON.stringify(doc))
}
