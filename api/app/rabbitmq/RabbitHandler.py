from aio_pika import connect_robust, Channel, IncomingMessage, Message
from aio_pika.pool import Pool
from loguru import logger
from app.core.config import settings
from app.api.api_v1.endpoints.connection_manager import manager
import json


# Message Receiving format
async def on_message(message: IncomingMessage) -> None:
    async with message.process():
        # logger.info(" [x] Received message %r" % message)
        msg = message.body.decode()
        logger.info("Message body is: %r" % msg)
        logger.info("Users Websockets: %r" % manager.users_ws)
        msg = json.loads(msg)

        if msg['topic'] == 'you-joined-as-peer' or msg['topic'] == 'you-joined-as-speaker':
            user_id = msg['d']['peerId']

            if user_id in manager.users_ws:
                user_ws = manager.users_ws[user_id]

                # redirect message to user with transport options
                await manager.send_personal_message(msg, user_ws)


class RabbitHandler:
    def __init__(self):
        self.uri = settings.RABBITMQ_URI
        self.connection_pool = None
        self.channel_pool = None
        self.queue_to_send = settings.RABBITMQ_SENDING_QUEUE
        self.queue_to_receive = settings.RABBITMQ_RECEIVING_QUEUE

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
