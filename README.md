# CrowdWire

With the emergence of Covid-19 all around the World, many people, companies and organizations started adopting remote procedures like video-conferences to continue doing the commons tasks they used to do "in person". Therefore, the search and use of these types of systems that allow video and voice calls has increased a lot.  Most of the current video communication systems are limited in the sense that they do not provide a remote interactive environment, side conversations, nor visualization that mimics real life behaviours. To solve this issue we want to incorporate, as much as possible, this component which is one of the most rewarding thing in real life meetings. Besides this, the ones that do, are not open source projects.


## Project Documentation

You can explore in detail the documentation of the Project through the  [**ProjectDocumentation Repository**](https://github.com/Crowd-Wire/ProjectDocumentation). A mkdocs website can checked too in the following [link](https://crowd-wire.github.io/ProjectDocumentation/).

## Acesses 

- [Web App Link](https://atnog-crowdwire1.av.it.pt/login)
- [API Documentation](https://atnog-crowdwire1.av.it.pt/api/v1/docs)

**Login Credentials**

| Email               | Password |
| ------------------- | -------- |
| speaker@example.com | string   |

## How to Run

### Web App

Template from https://demos.creative-tim.com/material-kit-react/#/?ref=mkr-readme

To run locally do the following commands:

```
$ cd frontend
$ npm install
$ npm start
```

### REST API

To run the REST API make sure to have Poetry installed first:

```
$ pip3 install poetry
```

Make sure to have Redis, RabbitMQ and PostgreSQL up and running.

PostgreSQL Installation through Docker:

```
$ docker run -P -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD="1234" --name pg postgres
```

Redis and RabbitMQ can be installed through the following script, which runs two `docker-compose` files, that use images belonging to [Bitnami](https://bitnami.com/)

```
$ cd api
$ sudo bash ./build-docker.sh
```

**NOTE**: Do not use directly the Redis configuration on production, since it can lead to data inconsistencies on a Sentinel Failure. For more Information Check the [Bitnami Documentation](https://github.com/bitnami/bitnami-docker-redis-sentinel)

Install the dependencies on the `poetry.lock` file and start Uvicorn Server

```
$ poetry install
$ poetry run uvicorn --host=0.0.0.0 app.main:app	
```

Additional notes may be checked on the `api `folder.

### Media Server

The folder `mediaserver`contains the information to run locally alongside with some additional notes.

### Infrastructure

Our Infrastructure has been built using [Kubernetes](https://kubernetes.io/). All information may be checked on the folder `k8s`.

## Development Team

- [MarioCSilva](https://github.com/MarioCSilva)
- [DanielGomes14](https://github.com/DanielGomes14)
- [leand12](https://github.com/leand12)
- [BrunosBastos](https://github.com/BrunosBastos)
- [pedrod33](https://github.com/pedrod33)

