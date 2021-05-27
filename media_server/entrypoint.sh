#!/bin/bash

RABBITMQ_HOST=$1

echo $RABBITMQ_HOST
echo "Waiting for RabbitMQ to Start..."

while ! nc -z $RABBITMQ_HOST 5672; do
  sleep 0.1
done

echo "RabbitMQ started"

node dist/index.js