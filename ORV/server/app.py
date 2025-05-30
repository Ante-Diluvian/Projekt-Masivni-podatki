from flask import Flask, request, jsonify
import os
import uuid
import logging
from pymongo import MongoClient
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from werkzeug.utils import secure_filename
import zipfile
import tempfile
import shutil

# Only CPU
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# Set up logging
logging.basicConfig(level=logging.INFO)

# Set up Flask app and upload folder
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# MongoDB connection
mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client["test"]
users_collection = db["users"]

# Load the pre-trained embedding model
embedding_model = tf.keras.models.load_model("model/final_model.keras")

# Preprocess image function
def preprocess_image(img_path, target_size=(112, 112)):
    img = image.load_img(img_path, target_size=target_size)
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

# Cosine similarity function
def cosine_similarity(a, b):
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return np.dot(a, b.T) / (norm_a * norm_b)

@app.route("/register", methods=["POST"])
def register():
    username = request.form.get("username") # Expecting a username
    zip_file = request.files.get("file") # Expecting a zip file with images

    if not username or not zip_file:
        return jsonify({"success": False, "error": "Missing username or file"}), 400 # Bad Request

    temp_dir = tempfile.mkdtemp() # Create a temporary directory to extract images
    zip_path = os.path.join(temp_dir, "images.zip") # Save the uploaded zip file
    zip_file.save(zip_path) # Save the zip file

    embeddings = []
    try:
        # Extract images
        with zipfile.ZipFile(zip_path, 'r') as zip_ref: # Open the zip file
            zip_ref.extractall(temp_dir) # Extract all contents to the temporary directory

        for root, dirs, files in os.walk(temp_dir): # Walk through the extracted files
            for file in files: # Iterate through each file
                if file.lower().endswith((".png", ".jpg", ".jpeg")): # Check for image files
                    img_path = os.path.join(root, file) # Get the full path of the image file
                    try:
                        img = preprocess_image(img_path) 
                        embedding = embedding_model.predict(img).flatten() # Get the embedding
                        embeddings.append(embedding) 
                    except Exception as e:
                        logging.error(f"Failed to process image '{file}': {str(e)}")

        if not embeddings:
            return jsonify({"success": False, "error": "No valid images processed"}), 400 # Bad Request

        avg_embedding = np.mean(embeddings, axis=0).tolist() # Calculate the average embedding

        users_collection.update_one(
            {"username": username},
            {"$set": {"userEmbedding": avg_embedding}},
            upsert=True # Update the user with the average embedding
        )

        logging.info(f"User '{username}' registered successfully with average embedding.") 
        return jsonify({"success": True}), 200 # OK

    except Exception as e:
        logging.error(f"Registration failed: {str(e)}")
        return jsonify({"success": False, "error": "Server error"}), 500 # Internal Server Error

    finally:
        # Clean up
        shutil.rmtree(temp_dir, ignore_errors=True)

# Login route
@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username") # Expecting a username
    img_file = request.files.get("image") # Expecting an image file

    if not username or not img_file:
        return jsonify({"success": False, "error": "Missing username or image"}), 400 # Bad Request

    user = users_collection.find_one({"username": username})
    if not user or "userEmbedding" not in user:
        return jsonify({"success": False, "error": "User not found"}), 404 # Not Found

    filename = f"{uuid.uuid4().hex}_{secure_filename(img_file.filename)}" # Generate a unique filename
    img_path = os.path.join(app.config['UPLOAD_FOLDER'], filename) # Define the path to save the image
    img_file.save(img_path) # Save the uploaded image file

    try:
        try:
            img = preprocess_image(img_path) # Preprocess the image
            new_embedding = embedding_model.predict(img).flatten() # Get the embedding for the new image
        except Exception as e:
            logging.error(f"Image processing or prediction failed: {str(e)}")
            return jsonify({"success": False, "error": "Failed to process image"}), 500 # Internal Server Error

        similarity = cosine_similarity(np.array(user["userEmbedding"]), new_embedding) # Calculate cosine similarity
        is_match = bool(similarity > 0.7) # Define a threshold for matching

        logging.info(f"Login attempt for '{username}': similarity = {similarity:.4f}, match = {is_match}")
        return jsonify({"success": is_match, "similarity": float(similarity)}), 200 # OK

    finally:
        if os.path.exists(img_path): # Remove the saved image file
            os.remove(img_path)

if __name__ == "__main__":
    app.run(debug=True)
