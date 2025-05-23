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

# Set up Flask app and upload folder
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Set up MongoDB connection
# Ensure you have the environment variables set for MongoDB connection
user = os.getenv("MONGO_USER")
password = os.getenv("MONGO_PASS")
host = os.getenv("MONGO_HOST")
mongo_uri = f"mongodb+srv://{user}:{password}@{host}/?retryWrites=true&w=majority&appName=Massive"
client = MongoClient(mongo_uri)
db = client["face_auth"]
users_collection = db["users"]

# Load the pre-trained model
embedding_model = tf.keras.models.load_model("model/final_model.keras")

# Preprocess the image
def preprocess_image(img_path, target_size=(112, 112)):
    img = image.load_img(img_path, target_size=target_size)
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

# Cosine similarity
def cosine_similarity(a, b):
    return np.dot(a, b.T) / (np.linalg.norm(a) * np.linalg.norm(b))