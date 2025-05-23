from flask import Flask, request, jsonify
import os
from pymongo import MongoClient
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from werkzeug.utils import secure_filename

# Only CPU
# os.environ["CUDA_VISIBLE_DEVICES"] = "0"  # Uncomment this line to use GPU
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

user = os.getenv("MONGO_USER")
password = os.getenv("MONGO_PASS")
host = os.getenv("MONGO_HOST")
mongo_uri = f"mongodb+srv://{user}:{password}@{host}/?retryWrites=true&w=majority&appName=Massive"
client = MongoClient(mongo_uri)
db = client["face_auth"]
users_collection = db["users"]

mongo_uri = f"mongodb+srv://{user}:{password}@{host}/?retryWrites=true&w=majority&appName=Massive"
client = MongoClient(mongo_uri)

embedding_model = tf.keras.models.load_model("model/final_model.keras")