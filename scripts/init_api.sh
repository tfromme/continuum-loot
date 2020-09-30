#!/bin/bash
cd ./api
python3 -m venv .env
.env/bin/pip install --upgrade pip
.env/bin/pip install -r requirements.txt
echo 'FLASK_APP=api.py' > .flaskenv
echo 'FLASK_ENV=development' >> .flaskenv
