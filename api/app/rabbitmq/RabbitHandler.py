from typing import Any

from aio_pika import connect_robust, Channel, IncomingMessage, Message, ExchangeType
from aio_pika.pool import Pool
from loguru import logger
from app.core.config import settings
from app.websockets.connection_manager import manager
import json
from app.core.consts import RabbitProtocol as protocol
from app.redis.connection import redis_connector
from app.k8s import k8s_handler


# Message Receiving format
async def on_message(message: IncomingMessage) -> None:
    async with message.process():
        msg = message.body.decode()
        msg = json.loads(msg)
        topic = msg['topic']
        # logger.info(" [x] Received message for topic  %r" % topic)

        if topic == protocol.GET_RECV_TRACKS_DONE \
                or topic == protocol.SEND_TRACK_SEND_DONE \
                or topic == protocol.SEND_FILE_SEND_DONE \
                or topic == protocol.CONNECT_TRANSPORT_RECV_DONE \
                or topic == protocol.CONNECT_TRANSPORT_SEND_DONE \
                or topic == protocol.YOU_JOINED_AS_PEER \
                or topic == protocol.YOU_JOINED_AS_SPEAKER \
                or topic == protocol.YOU_ARE_NOW_A_SPEAKER:

            if 'error' in msg['d']:
                return
            user_id = msg['d']['peerId']

            await manager.send_personal_message(msg, user_id)

        elif topic == protocol.NEW_PEER_PRODUCER \
                or topic == protocol.NEW_PEER_DATA_PRODUCER:
            # uid identifies to whom the message is suppost to be sent to
            # peerId identifies the new peerId that joined
            user_id = msg['uid']

            await manager.send_personal_message(msg, user_id)

        elif topic == protocol.CREATE_NEW_REPLICA:
            # TODO:
            logger.info("Received Request to scale replicas..")
            logger.info("Scaling Replicas")
            k8s_handler.scale_mediaserver_replicas()
            # handle concurrency here with other api replicas
            # to avoid each one of them creating a media server
            await redis_connector.add_media_server()

        elif topic == protocol.CLOSE_CONSUMER:
            logger.info(msg)
        elif topic == protocol.ERROR:
            logger.info(msg)
        else:
            logger.error(f"Unknown topic \"{topic}\"")


async def on_replica_message(message: IncomingMessage) -> None:
    async with message.process():
        msg = message.body.decode()
        msg = json.loads(msg)
        users = msg['users']
        logger.info(users)
        logger.info(msg)
        logger.info("dentro da cena das replicas")
        for user_id in users:
            await manager.send_personal_message(msg['message'], user_id, False)


class RabbitHandler:
    def __init__(self):
        self.uri = settings.RABBITMQ_URI
        self.connection_pool = None
        self.channel_pool = None
        self.queue_to_send = settings.RABBITMQ_SENDING_QUEUE
        self.queue_to_receive = settings.RABBITMQ_RECEIVING_QUEUE
        self.replicas_queue = settings.RABBITMQ_REPLICA_QUEUE

    async def start_pool(self):
        self.connection_pool = Pool(self.get_connection, max_size=2)
        self.channel_pool = Pool(self.get_channel, max_size=10)
        await self.consume()
        await self.consume_replica()

    async def get_connection(self):
        return await connect_robust(self.uri)

    async def get_channel(self) -> Channel:
        if self.connection_pool:
            async with self.connection_pool.acquire() as connection:
                logger.info("Channel Created")
                return await connection.channel()
        logger.warning("No Pool defined, cannot get a channel")


    async def publish(self, message: dict, queue: str = "") -> None:
        queues_to_send = set()
        if queue != "":
            queues_to_send.add(queue)
        elif 'roomIds' in message['d']:
            for room in message['d']['roomIds']:
                queues_to_send.add(await redis_connector.get('room_' + room))
        elif 'roomId' in message['d']:
            logger.info(message['d']['roomId'])
            queues_to_send.add(await redis_connector.get('room_' + message['d']['roomId']))
        message = (json.dumps(message)).encode()
        async with self.channel_pool.acquire() as channel:  # type: Channel
            for queue in queues_to_send:
                logger.info("Published message to Queue %r" % queue)
                await channel.default_exchange.publish(
                    Message(message),
                    queue,
                )

    async def consume(self) -> None:
        async with self.channel_pool.acquire() as channel:  # type: Channel
            await channel.set_qos(0)
            queue = await channel.declare_queue(
                self.queue_to_receive, durable=True
            )
            await queue.consume(on_message)

    async def publish_replica(self, message: str) -> None:
        async with self.channel_pool.acquire() as channel:  # type: Channel
            replicas_exchange = await channel.declare_exchange(
                self.replicas_queue, ExchangeType.FANOUT
            )
            await replicas_exchange.publish(
                Message(message.encode()),
                routing_key=self.replicas_queue,

            )
            logger.info("Published message to Channel %r" % channel)

    async def consume_replica(self) -> None:
        async with self.channel_pool.acquire() as channel:
            await channel.set_qos(0)
            replicas_exchange = await channel.declare_exchange(
                self.replicas_queue, ExchangeType.FANOUT
            )
            queue = await channel.declare_queue(
               exclusive=True
            )
            await queue.bind(replicas_exchange)
            await queue.consume(on_replica_message)


rabbit_handler = RabbitHandler()
