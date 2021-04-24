RABBIT_PATH=app/rabbitmq/conf/docker-compose.yml
REDIS_PATH=app/redis/conf/docker-compose.yml

echo "Running Rabbit.."
docker-compose -f $RABBIT_PATH build
docker-compose -f $RABBIT_PATH up -d

echo "Running Redis.."
docker-compose -f $REDIS_PATH build
docker-compose -f $REDIS_PATH up -d

echo "services up :)"