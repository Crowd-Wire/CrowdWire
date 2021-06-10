#!/bin/bash
echo "Waiting for RabbitMQ to Start..."

until timeout 1 bash -c "cat < /dev/null > /dev/tcp/${RABBITMQ_SERVICE_NAME}/5672"; do
        >&2 echo "Waiting for RabbitMQ at \"${RABBITMQ_SERVICE_NAME}:5672\"..."
        sleep 1
done

#while ! nc -z $RABBITMQ_SERVICE_NAME 5672; do
  #sleep 0.1
#done

echo "RabbitMQ started"

echo "Waiting for Postgres to Start..."

while ! nc -z $POSTGRES_SERVICE_NAME 5432; do
  sleep 0.1
done
echo "Postgres started"

#run poetry and fastapi server
#poetry run alembic upgrade head
poetry run uvicorn --host=0.0.0.0 app.main:app	