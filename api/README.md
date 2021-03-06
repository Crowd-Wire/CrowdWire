## API 


### Code Coverage

In order to test code coverage use:
```
poetry run coverage run --source=app -m pytest 
```

This will run pytest and checks every file inside *app* directory.
Then creates a *.coverage* file that stores the informations for the report.

To get the results use:
```
poetry run coverage report -m
```

To get the report in html format use:
```
poetry run coverage html
```

It creates a folder with multiple html files.

### Google Authentication

For the Google Authentication feature to work it is required to have .env file in the same directory of 
the app, in this directory for our case.

The .env file should contain 2 variables and should look something like this:
CLIENT_ID="googleapi.com"
CLIENT_SECRET="randomsecret"

For these to work, the application needs to be registered in the google api platform.
Do not forget to change the address that has access to the api when going into production.


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