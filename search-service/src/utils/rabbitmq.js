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

const consumeEvent = async (routingKey, callback) => {
  try {
    if (!channel) {
      await connectRabbitmq();
    }
    const q = await channel.assertQueue("", { exclusive: true });
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);

    await channel.consume(q.queue, (msg) => {
      if (msg != null) {
        const content = JSON.parse(msg.content.toString());
        callback(content);
        channel.ack(msg);
      }
    });
  } catch (error) {
    logger.warn("Internal server error : ", error);
  }
};

module.exports = { connectRabbitmq, consumeEvent };
