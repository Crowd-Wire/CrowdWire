FROM python:3.8.1-slim

ENV PYTHONUNBUFFERED 1

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

#run poetry and fastapi server
#poetry run alembic upgrade head
CMD poetry run uvicorn --host=0.0.0.0 app.main:app	
