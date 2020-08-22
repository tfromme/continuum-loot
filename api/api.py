import sqlite3
from contextlib import contextmanager

from flask import Flask
app = Flask(__name__)


@contextmanager
def getDb():
    conn = sqlite3.connect('contloot.db')
    conn.row_factory = sqlite3.Row
    db = conn.cursor()
    try:
        yield db
        conn.commit()
    finally:
        conn.close()
