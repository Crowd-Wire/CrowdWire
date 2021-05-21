from aio_pika import connect_robust, Channel, IncomingMessage, Message
from aio_pika.pool import Pool
from loguru import logger
from app.core.config import settings
from app.websocket.connection_manager import manager
import json
from app.core.consts import RabbitProtocol as protocol


# Message Receiving format
async def on_message(message: IncomingMessage) -> None:
    async with message.process():
        msg = message.body.decode()
        msg = json.loads(msg)
        topic = msg['topic']
        # logger.info(" [x] Received message for topic  %r" % topic)

        if topic == protocol.GET_RECV_TRACKS_DONE\
                or topic == protocol.SEND_TRACK_SEND_DONE\
                or topic == protocol.SEND_FILE_SEND_DONE\
                or topic == protocol.CONNECT_TRANSPORT_RECV_DONE\
                or topic == protocol.CONNECT_TRANSPORT_SEND_DONE\
                or topic == protocol.YOU_JOINED_AS_PEER\
                or topic == protocol.YOU_JOINED_AS_SPEAKER\
                or topic == protocol.YOU_ARE_NOW_A_SPEAKER:

            if 'error' in msg['d']:
                return
            user_id = msg['d']['peerId']

            await manager.send_personal_message(msg, user_id)
        elif topic == protocol.NEW_PEER_PRODUCER\
            or topic == protocol.NEW_PEER_DATA_PRODUCER:
            # uid identifies to whom the message is suppost to be sent to
            # peerId identifies the new peerId that joined
            user_id = msg['uid']

            await manager.send_personal_message(msg, user_id)
        elif topic == protocol.CLOSE_CONSUMER:
            logger.info(msg)
        elif topic == protocol.ERROR:
            logger.info(msg)
        else:
            logger.error(f"Unknown topic \"{topic}\"")


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
