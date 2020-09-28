This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

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
yarn
yarn init-api
yarn build-db
```

This will install all dependencies, setup a python venv for the backend, and build the DB with seed data

## Running Locally

`yarn start` and `yarn start-api` will both need to be running for the app to work
<br />
The app is hosted on `localhost:3000` and the API is proxied through `localhost:5000`


## Available Scripts

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

The current test suite is practically non-existant (I know, I know)

### `yarn lint`

Runs the frontend code through `ESLint` and the backend code through `flake8` and `mypy`
<br />
No CI pipelines are setup with this yet, so running it locally is necessary

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!
<br />
This isn't very useful unless you have the rights to deploy (you don't)

### `yarn deploy`

Deploys the app to production (https://continuum-loot.tfrom.me)
<br />
This won't work for you since it requires my SSH keys (which you don't have)
