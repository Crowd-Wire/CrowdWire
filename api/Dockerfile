FROM python:3.8.1-slim

ENV PYTHONUNBUFFERED 1

# install netcat
RUN apt-get update && \
    apt-get -y install netcat && \
    apt-get clean

EXPOSE 8000
WORKDIR /app


COPY poetry.lock pyproject.toml ./


#Poetry installation and virtual environment configured in the root of the project
RUN pip install poetry==1.1 && \
    poetry config virtualenvs.create false && \
    poetry install --no-dev

COPY . ./


#test api
HEALTHCHECK --interval=21s --timeout=3s --start-period=10s CMD curl --fail http://localhost:8000/ping || exit 1


# add entrypoint.sh
COPY ./entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]

