const amqp = require('amqplib')

const url = 'amqp://guest:guest@localhost:5672'
const MAX_TTL = 30000 // 30seg

let channel
async function createConnection(url) {
  try {
    const conn = await amqp.connect(url)
    channel = await conn.createChannel()
  } catch (err) {
    console.log(err)
  }
}

async function assertExchange(exchange, type, options) {
  try {
    await channel.assertExchange(exchange, type, options)
  } catch (err) {
    console.log(err)
  }
}

async function assertQueue(queue, options) {
  try {
    await channel.assertQueue(queue, options)
  } catch (err) {
    console.log(err)
  }
}

async function bindQueue(queue, exchange, pattern, options) {
  try {
    await channel.bindQueue(queue, exchange, pattern, options)
  } catch (err) {
    console.log(err)
  }
}

async function getConnection() {
  if (channel) {
    return channel
  }
  await createConnection()
  // Create exchanges
  await assertExchange('workExchange', 'direct', { durable: true })
  await assertExchange('retryExchange', 'direct', { durable: true })

  // Create queues
  await assertQueue('workQueue', {
    durable: true,
    deadLetterExchange: 'retryExchange',
    messageTtl: MAX_TTL,
  })
  await assertQueue('retryQueue', {
    durable: true,
    deadLetterExchange: 'workExchange',
    messageTtl: MAX_TTL,
  })

  // Bind exchanges with queues
  await bindQueue('workQueue', 'workExchange', '', {
    durable: true,
  })
  await bindQueue('retryQueue', 'retryExchange', '', {
    durable: true,
  })

  // Return the channel connection
  return channel
}

module.exports = { getConnection }
