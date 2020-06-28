var { getConnection } = require('./channel')

async function consume() {
  const channel = await getConnection()
  // Start to listen the queue
  channel.consume('workQueue', async msg => {
    await doSomeStuff(msg, channel)
  })
}
consume()

async function doSomeStuff(msg, channel) {
  const parsedMsg = JSON.parse(msg.content.toString())
  // Check expiration time
  if (Date.now() - parsedMsg.createdAt > 1000 * 60 * 2) {
    // 3 minutes
    console.log(`Time expired, for the task ID: ${parsedMsg.id}, marked as timeout`)
    const updatedMsg = {
      ...parsedMsg,
      ...{ status: 98, updatedAt: Date.now() },
    }
    return channel.ack(msg)
  }
  switch (parsedMsg.status) {
    case 1:
      // Fake rejection
      if (Math.random() > 0.6) {
        // To send this message to the "rejected" exchange (dead-lettered), set false as a second argument
        channel.reject(msg, false)
      } else {
        setTimeout(async () => {
          const updatedMsg = {
            ...parsedMsg,
            ...{ status: 2, updatedAt: Date.now() },
          }
          channel.ack(msg)
          await channel.publish('workExchange', '', encode(updatedMsg))
        }, 5000)
      }
      break
    case 2:
      if (Math.random() > 0.6) {
        channel.reject(msg, false)
      } else {
        setTimeout(async () => {
          const updatedMsg = {
            ...parsedMsg,
            ...{ status: 3, updatedAt: Date.now() },
          }
          channel.ack(msg)
          await channel.publish('workExchange', '', encode(updatedMsg))
        }, 5000)
      }
      break
    case 3:
      if (Math.random() > 0.6) {
        channel.reject(msg, false)
      } else {
        setTimeout(() => {
          const updatedMsg = {
            ...parsedMsg,
            ...{ status: 4, updatedAt: Date.now() },
          }
          channel.ack(msg)
          console.log(`the task ID: ${parsedMsg.id} ended successfully`)
        }, 5000)
      }
      break
    default:
      console.log('upps!, default', parsedMsg)
      channel.ack(msg)
  }
}

function encode(doc) {
  return Buffer.from(JSON.stringify(doc))
}
