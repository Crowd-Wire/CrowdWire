## API 


### Alembic

Create alembic folder:

```
poetry run alembic init alembic
```

After executing this command it will appear in this directory
a folder called alembic and the alembic.ini file

In the alembic.ini file there is a link to the database that should be
changed to match yours. This is only used when testing locally.

When in production, alembic should get the database from env variables.
For that change the env.py file inside alembic folder to get the database information
from the env variables using os.env()

Create the first migration:

```
poetry run alembic revision --autogenerate -m "First Commit"
```

This command will auto-generate a migration that creates the models of the database.
For that it is necessary to import in the env.py file our Base class that is used 
to create all the models. This allows alembic to know which models to create.

Note: Because we are using a schema it is necessary to change the code in the revision file.
Use op.execute("create schema fastapi") and op.execute("drop schema fastapi") in the functions
upgrade and downgrade respectively.

Run the first migration:

```
poetry run alembic upgrade +1
```

With this the database tables are created.

Undo migration:

```
poetry run alembic downgrade -1
```

This command will undo the last migration and in our case will delete all the tables.

Note: Changing the number -1 or +1 will run other migrations that you have.
It is also possible to use "head" instead of +1

delete older revisions from db:
```
delete from alembic_version;
```