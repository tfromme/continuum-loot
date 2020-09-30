#!/bin/bash
cd ./api
.env/bin/python setupDb.py
cd migrate_data
../.env/bin/python load_data.py
