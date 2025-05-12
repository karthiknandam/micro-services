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
    await connectToRabbitMQ();
  }

  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message))
  );
  logger.info(`Event published: ${routingKey}`);
};

module.exports = { connectRabbitmq, publishEvent };
