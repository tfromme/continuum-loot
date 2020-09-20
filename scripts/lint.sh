./node_modules/.bin/eslint src/
cd api
./.env/bin/flake8 *.py
./.env/bin/mypy *.py
