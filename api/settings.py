import os
from dotenv import load_dotenv

load_dotenv('./.app_env')

LOG_DIR = os.getenv("LOG_DIR") or './dev_logs/'
SECRET_KEY = os.getenv("SECRET_KEY") or 'secret'

os.makedirs(LOG_DIR, exist_ok=True)  # Ensure log directory exists
