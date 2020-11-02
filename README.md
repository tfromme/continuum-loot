## Developer Setup

### Pre-requisites

node - I use v14.0.0
<br />
yarn - I use 1.22.4
<br />
python3-dev - I use 3.6.9 locally and it runs on 3.8.2
<br />
python3-venv - Assumed by setup scripts, general best practice

### Initialization

To setup a new development environment:
```bash
./manage init-frontend
./manage init-backend
```

This will install all dependencies, setup a python venv for the backend, and build the DB with seed data

## Running Locally

`yarn start` in `frontend/` will serve the frontend.<br />
`env/bin/python manage.py runserver` in `backend/` will serve the backend.<br />
These are aliased by `./manage start-frontend` and `./manage start-backend` respectively.<br />
The app is hosted on `localhost:3000` and the API is proxied through `localhost:8000`.

## Addon

Written in Lua<br />
<br />
Copy `ContinuumLoot` to your `interface/addons` folder.<br />
In-game: `/cloot attendance` will give you an export sting of everybody in your current group for pasting into the frontend.

## Frontend

Written in React<br />
<br />
There are no special developer scripts here.<br />
The main file is `App.js` which pulls components from `modules/`

## Backend

Written in Django using the Django Rest Framework<br />
<br />
`source env/bin/activate` will enter the python venv and `deactivate` will leave it.<br />
This will allow you to type `python` and have it reference the venv without having to type `env/bin/python` every time.<br />
<br />

### `manage.py`

This is the Django management script.

#### `python manage.py runserver`

This runs the API server.

#### `python manage.py shell_plus`

This enters the Django shell.<br />
You can interact with the database here to test Django code and see the current state of the data.

#### `python manage.py makemigrations`

Anytime you change something in the models, this will autogenerate a new migration file.

#### `python manage.py migrate`

This will intelligently migrate the database according to the migration files.

### Django Admin

#### `localhost:8000/admin`

This is the Django admin page, you will need to have created a superuser to login.<br />
This is a built-in website that can be configured to developer needs.<br />
Here, you can more visually interact with the database and change it live.<br />
