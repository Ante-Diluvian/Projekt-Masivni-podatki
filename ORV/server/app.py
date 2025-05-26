from flask import Flask, request, jsonify
import os
import uuid
import logging
from pymongo import MongoClient
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from werkzeug.utils import secure_filename

# Only CPU
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# Set up logging
logging.basicConfig(level=logging.INFO)

# Set up Flask app and upload folder
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Set up MongoDB connection
user = os.getenv("MONGO_USER")
password = os.getenv("MONGO_PASS")
host = os.getenv("MONGO_HOST")
mongo_uri = f"mongodb+srv://{user}:{password}@{host}/?retryWrites=true&w=majority&appName=Massive"
client = MongoClient(mongo_uri)
db = client["test"]
users_collection = db["users"]

embedding_model = tf.keras.models.load_model("model/final_model.keras")

def preprocess_image(img_path, target_size=(112, 112)):
    img = image.load_img(img_path, target_size=target_size)
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def cosine_similarity(a, b):
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return np.dot(a, b.T) / (norm_a * norm_b)

@app.route("/register", methods=["POST"])
def register():
    username = request.form.get("username")
    img_file = request.files.get("image")

    if not username or not img_file:
        return jsonify({"success": False, "error": "Missing username or image"}), 400

    filename = f"{uuid.uuid4().hex}_{secure_filename(img_file.filename)}"
    img_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    img_file.save(img_path)

    try:
        try:
            img = preprocess_image(img_path)
            embedding = embedding_model.predict(img).flatten().tolist()
        except Exception as e:
            logging.error(f"Image processing or prediction failed: {str(e)}")
            return jsonify({"success": False, "error": "Failed to process image"}), 500

        users_collection.update_one(
            {"username": username},
            {"$set": {"userEmbedding": embedding}},
            upsert=True
        )

        logging.info(f"User '{username}' registered successfully.")
        return jsonify({"success": True}), 200

    finally:
        if os.path.exists(img_path):
            os.remove(img_path)

# Login route
@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")
    img_file = request.files.get("image")

    if not username or not img_file:
        return jsonify({"success": False, "error": "Missing username or image"}), 400

    user = users_collection.find_one({"username": username})
    if not user or "userEmbedding" not in user:
        return jsonify({"success": False, "error": "User not found"}), 404

    filename = f"{uuid.uuid4().hex}_{secure_filename(img_file.filename)}"
    img_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    img_file.save(img_path)

    try:
        try:
            img = preprocess_image(img_path)
            new_embedding = embedding_model.predict(img).flatten()
        except Exception as e:
            logging.error(f"Image processing or prediction failed: {str(e)}")
            return jsonify({"success": False, "error": "Failed to process image"}), 500

        similarity = cosine_similarity(np.array(user["userEmbedding"]), new_embedding)
        is_match = similarity > 0.7

        logging.info(f"Login attempt for '{username}': similarity = {similarity:.4f}, match = {is_match}")
        return jsonify({"success": is_match, "similarity": float(similarity)}), 200

    finally:
        if os.path.exists(img_path):
            os.remove(img_path)

if __name__ == "__main__":
    app.run(debug=True)
