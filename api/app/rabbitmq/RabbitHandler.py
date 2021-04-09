from aio_pika import connect_robust, Channel, IncomingMessage, Message
from aio_pika.pool import Pool
from loguru import logger
from app.core.config import settings


# Message Receiving format
async def on_message(message: IncomingMessage) -> None:
    async with message.process():
        logger.info(" [x] Received message %r" % message)
        logger.info("     Message body is: %r" % message.body.decode())


class RabbitHandler:
    def __init__(self):
        self.uri = settings.RABBITMQ_URI
        self.connection_pool = None
        self.channel_pool = None
        self.queue_to_send = settings.RABBITMQ_SENDING_QUEUE
        self.queue_to_receive = settings.RABBITMQ_SENDING_QUEUE

    async def start_pool(self):
        self.connection_pool = Pool(self.get_connection, max_size=2)
        self.channel_pool = Pool(self.get_channel, max_size=10)
        await self.consume()

    async def get_connection(self):
        return await connect_robust(self.uri)

    async def get_channel(self) -> Channel:
        if self.connection_pool:
            async with self.connection_pool.acquire() as connection:
                logger.info("Channel Created")
                return await connection.channel()
        logger.warning("No Pool defined, cannot get a channel")

    async def publish(self, message: str) -> None:
        async with self.channel_pool.acquire() as channel:  # type: Channel
            await channel.default_exchange.publish(
                Message(message.encode()),
                self.queue_to_send,
            )
            logger.info("Published message to Channel %r" % channel)

    async def consume(self) -> None:
        async with self.channel_pool.acquire() as channel:  # type: Channel
            await channel.set_qos(10)
            queue = await channel.declare_queue(
                self.queue_to_receive, durable=True
            )
            await queue.consume(on_message)


rabbit_handler = RabbitHandler()
