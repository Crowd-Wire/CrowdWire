#!/bin/bash

RABBITMQ_HOST=$1

echo $RABBITMQ_HOST

until timeout 1 bash -c "cat < /dev/null > /dev/tcp/${RABBITMQ_HOST}/5672"; do
        >&2 echo "Waiting for RabbitMQ at \"${RABBITMQ_HOST}:5672\"..."
        sleep 1
done

echo "RabbitMQ started"

node dist/index.js