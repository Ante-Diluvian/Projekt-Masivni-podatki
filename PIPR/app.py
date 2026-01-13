from flask import Flask, request, jsonify
import os
import uuid
import logging
from pymongo import MongoClient
import numpy as np
from werkzeug.utils import secure_filename
import zipfile
import tempfile
import shutil
from mpi4py import MPI
import pickle

# Only CPU
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import tensorflow as tf
from tensorflow.keras.preprocessing import image

# Initialize MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

# Set up logging - each rank logs to its own file
log_filename = f'rank_{rank}_log.txt'
logging.basicConfig(
    level=logging.INFO,
    format=f'[Rank {rank}] %(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_filename),
        logging.StreamHandler()
    ]
)

logging.info(f"Starting process with rank {rank} out of {size} total processes")

# Set up Flask app and upload folder (only for rank 0)
if rank == 0:
    app = Flask(__name__)
    app.config['UPLOAD_FOLDER'] = 'uploads'
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # MongoDB connection (only rank 0 needs this)
    mongo_uri = os.getenv("MONGO_URI")
    client = MongoClient(mongo_uri)
    db = client["test"]
    users_collection = db["users"]
    logging.info("MongoDB connection established")

# Load the pre-trained embedding model (all ranks need this)
logging.info("Loading embedding model...")
embedding_model = tf.keras.models.load_model("model/final_mobilefacenet_fold1.keras")
logging.info("Model loaded successfully")

# Preprocess image function
def preprocess_image(img_path, target_size=(224, 224)):
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

def process_images_worker(image_paths):
    """Worker function to process a list of image paths and return embeddings"""
    embeddings = []
    logging.info(f"Processing {len(image_paths)} images")

    for img_path in image_paths:
        try:
            img = preprocess_image(img_path)
            embedding = embedding_model.predict(img, verbose=0)
            if isinstance(embedding, list):
                embedding = embedding[0]
            embedding = embedding.flatten()
            embeddings.append(embedding)
            logging.info(f"Successfully processed: {os.path.basename(img_path)}")
        except Exception as e:
            logging.error(f"Failed to process image '{img_path}': {str(e)}")

    logging.info(f"Completed processing {len(embeddings)} images successfully")
    return embeddings

def distribute_work(image_paths):
    """Rank 0 distributes image paths among all ranks"""
    total_images = len(image_paths)
    logging.info(f"Total images to process: {total_images}")

    # Calculate how many images each rank should process
    images_per_rank = total_images // size
    remainder = total_images % size

    # Distribute images
    distributed_paths = []
    start_idx = 0

    for i in range(size):
        # Give one extra image to the first 'remainder' ranks
        end_idx = start_idx + images_per_rank + (1 if i < remainder else 0)
        rank_paths = image_paths[start_idx:end_idx]
        distributed_paths.append(rank_paths)
        logging.info(f"Rank {i} will process {len(rank_paths)} images")
        start_idx = end_idx

    return distributed_paths

if rank == 0:
    @app.route("/register", methods=["POST"])
    def register():
        username = request.form.get("username")
        zip_file = request.files.get("file")

        if not username or not zip_file:
            return jsonify({"success": False, "error": "Missing username or file"}), 404


        nfs_base_path = "/home/mpirun/mpi_share/"
        temp_dir = tempfile.mkdtemp(dir=nfs_base_path)

        zip_path = os.path.join(temp_dir, "images.zip")
        zip_file.save(zip_path)

        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                file_list = zip_ref.namelist()
                zip_ref.extractall(temp_dir)

            # Ensure all nodes have the same permissions to read the extracted files
            os.chmod(temp_dir, 0o755)

            image_paths = []
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    if file.lower().endswith((".png", ".jpg", ".jpeg")):
                        img_path = os.path.join(root, file)
                        # Use absolute paths to ensure workers find them
                        image_paths.append(os.path.abspath(img_path))

            if not image_paths:
                return jsonify({"success": False, "error": "No valid images found", "files_in_zip": file_list}), 400

            logging.info(f"Found {len(image_paths)} valid images")

            # Distribute work among all ranks
            distributed_paths = distribute_work(image_paths)

            # Send image paths to each rank
            for i in range(size):
                if i == 0:
                    # Rank 0 processes its own share
                    my_paths = distributed_paths[0]
                else:
                    # Send paths to other ranks
                    logging.info(f"Sending {len(distributed_paths[i])} paths to rank {i}")
                    comm.send(distributed_paths[i], dest=i, tag=1)

            # Process own share
            logging.info(f"Rank 0 processing {len(my_paths)} images")
            my_embeddings = process_images_worker(my_paths)

            # Collect embeddings from all ranks
            all_embeddings = [my_embeddings]

            for i in range(1, size):
                logging.info(f"Waiting for results from rank {i}")
                received_embeddings = comm.recv(source=i, tag=2)
                logging.info(f"Received {len(received_embeddings)} embeddings from rank {i}")
                all_embeddings.append(received_embeddings)

            # Flatten the list of embeddings
            embeddings = [emb for rank_embs in all_embeddings for emb in rank_embs]

            if not embeddings:
                return jsonify({"success": False, "error": "No valid images processed", "files_in_zip": file_list}), 400

            logging.info(f"Total embeddings collected: {len(embeddings)}")

            # Calculate average embedding
            avg_embedding = np.mean(embeddings, axis=0).tolist()

            # Save to database
            users_collection.update_one(
                {"username": username},
                {"$set": {"userEmbedding": avg_embedding}},
                upsert=True
            )

            logging.info(f"User '{username}' registered successfully with average embedding from {len(embeddings)} images.")
            return jsonify({"success": True, "files_in_zip": file_list, "images_processed": len(embeddings)}), 200

        except Exception as e:
            logging.error(f"Registration failed: {str(e)}")
            return jsonify({"success": False, "error": "Server error"}), 500

        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

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
                new_embedding = embedding_model.predict(img, verbose=0)
                if isinstance(new_embedding, list):
                    new_embedding = new_embedding[0]
                new_embedding = new_embedding.flatten()
            except Exception as e:
                logging.error(f"Image processing or prediction failed: {str(e)}")
                return jsonify({"success": False, "error": "Failed to process image"}), 500

            similarity = cosine_similarity(np.array(user["userEmbedding"]), new_embedding)
            is_match = bool(similarity > 0.6)

            logging.info(f"Login attempt for '{username}': similarity = {similarity:.4f}, match = {is_match}")
            return jsonify({"success": is_match, "similarity": float(similarity)}), 200

        finally:
            if os.path.exists(img_path):
                os.remove(img_path)

else:
    # Worker ranks wait for tasks
    logging.info(f"Worker rank {rank} ready and waiting for tasks")

    while True:
        # Wait for image paths from rank 0
        logging.info("Waiting for work assignment...")
        image_paths = comm.recv(source=0, tag=1)

        logging.info(f"Received {len(image_paths)} images to process")

        # Process assigned images
        embeddings = process_images_worker(image_paths)

        # Send results back to rank 0
        logging.info(f"Sending {len(embeddings)} embeddings back to rank 0")
        comm.send(embeddings, dest=0, tag=2)
        logging.info("Results sent successfully")

if __name__ == "__main__":
    if rank == 0:
        logging.info("Starting Flask server on rank 0")
        app.run(debug=False, host='0.0.0.0', port=5000)
    else:
        logging.info(f"Rank {rank} entering worker loop")
        # Worker ranks stay in the while loop above
