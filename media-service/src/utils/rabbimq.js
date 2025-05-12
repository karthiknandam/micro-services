const amqp = require("amqplib");
const logger = require("./logger");
let connection = null;
let channel = null;

const EXCHANGE_NAME = "social-media";

const connectRabbitmq = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    logger.info("Channel created ✅");
    return channel;
  } catch (error) {
    logger.warn("Internal server error while connecting to rabbitmq", error);
  }
};

const publishEvent = async (routingKey, message) => {
  if (!channel) {
    await connectRabbitmq();
  }

  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message))
  );
  logger.info(`Event published : ${routingKey}`);
};

const consumeEvent = async (routingKey, message) => {
  if (!channel) {
    await connectRabbitmq;
  }

  const q = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);

  channel.consume(q.queue, (msg) => {
    if (msg !== null) {
      const content = JSON.parse(msg.content.toString());
      callback(content);
      channel.ack(msg);
    }
  });

  logger.info(`Subscribbed to event : ${routingKey}`);
};

module.exports = { connectRabbitmq, publishEvent, consumeEvent };
