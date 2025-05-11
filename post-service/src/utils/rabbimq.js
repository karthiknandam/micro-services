const amqp = require("amqplib");
const logger = require("./logger");
let connection = null;
let channel = null;

const EXCHANEG = "social-media";

const connectRabbitmq = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANEG, "topic", { durable: false });
    logger.info("Channel created ✅");
    return channel;
  } catch (error) {
    logger.warn("Internal server error while connecting to rabbitmq", error);
  }
};

module.exports = { connectRabbitmq };
