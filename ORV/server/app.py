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
from PIL import Image
import struct

# Only CPU
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import tensorflow as tf
from tensorflow.keras.preprocessing import image

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
embedding_model = tf.keras.models.load_model("model/final_mobilefacenet_fold1.keras")


# Quantization matrix (same as compression)
Q = np.array([
    16, 11, 10, 16, 24, 40, 51, 61,
    12, 12, 14, 19, 26, 58, 60, 55,
    14, 13, 16, 24, 40, 57, 69, 56,
    14, 17, 22, 29, 51, 87, 80, 62,
    18, 22, 37, 56, 68, 109, 103, 77,
    24, 35, 55, 64, 81, 104, 113, 92,
    49, 64, 78, 87, 103, 121, 120, 101,
    72, 92, 95, 98, 112, 100, 103, 99
], dtype=np.int16).reshape(8, 8)


def compute_idct_matrix():
    """Precompute IDCT transformation matrix for efficiency"""
    C = np.array([1/np.sqrt(2), 1, 1, 1, 1, 1, 1, 1])
    idct_matrix = np.zeros((8, 8))
    
    for x in range(8):
        for u in range(8):
            idct_matrix[x, u] = C[u] * np.cos((2 * x + 1) * u * np.pi / 16) / 2
    
    return idct_matrix


# Precompute IDCT matrix
IDCT_MATRIX = compute_idct_matrix()


def idct_8x8(block):
    """
    Apply 2D Inverse DCT on an 8x8 block using matrix multiplication
    """
    # 2D IDCT: IDCT_MATRIX @ block @ IDCT_MATRIX.T
    temp = IDCT_MATRIX @ block
    result = temp @ IDCT_MATRIX.T
    return result


def rle_decode_dctrle(rle_data):
    """
    Decode RLE data from .dctrle format.
    Format: [count, value, count, value, ...]
    Returns array of Int16 values
    """
    decoded = []
    
    # RLE data is pairs of (count, value)
    for i in range(0, len(rle_data), 2):
        if i + 1 < len(rle_data):
            count = int(rle_data[i])
            value = int(rle_data[i + 1])
            decoded.extend([value] * count)
    
    return np.array(decoded, dtype=np.int16)


def decompress_dctrle_image(dctrle_path, output_path, width=224, height=224):
    """
    Decompress a .dctrle file back to a PNG image.
    
    Args:
        dctrle_path: Path to .dctrle file (Int16Array RLE encoded)
        output_path: Path to save decompressed PNG
        width: Image width (default 224)
        height: Image height (default 224)
    """
    try:
        # Read the .dctrle file as Int16Array
        with open(dctrle_path, 'rb') as f:
            raw_bytes = f.read()
        
        # Convert bytes to Int16Array
        num_int16 = len(raw_bytes) // 2
        rle_data = struct.unpack(f'<{num_int16}h', raw_bytes)
        
        # RLE Decode
        dct_coeffs = rle_decode_dctrle(rle_data)
        
        # Expected number of 8x8 blocks
        num_blocks_x = width // 8
        num_blocks_y = height // 8
        total_coeffs = num_blocks_x * num_blocks_y * 64
        
        if len(dct_coeffs) != total_coeffs:
            logging.warning(f"DCT coefficients mismatch: expected {total_coeffs}, got {len(dct_coeffs)}")
            # Pad or truncate
            if len(dct_coeffs) < total_coeffs:
                dct_coeffs = np.pad(dct_coeffs, (0, total_coeffs - len(dct_coeffs)))
            else:
                dct_coeffs = dct_coeffs[:total_coeffs]
        
        # Reshape to blocks: (num_blocks_y, num_blocks_x, 8, 8)
        dct_coeffs = dct_coeffs.reshape(num_blocks_y, num_blocks_x, 8, 8)
        
        # Reconstruct image
        reconstructed = np.zeros((height, width), dtype=np.float32)
        
        block_idx = 0
        for by in range(0, height, 8):
            for bx in range(0, width, 8):
                block_y = by // 8
                block_x = bx // 8
                
                # Get quantized DCT coefficients for this block
                dct_block = dct_coeffs[block_y, block_x]
                
                dct_block = dct_block.T
                
                # Dequantize (multiply by quantization matrix)
                dequantized = dct_block.astype(np.float32) * Q
                
                # Apply Inverse DCT
                spatial_block = idct_8x8(dequantized)
                
                # Add 128 (reverse the level shift from compression)
                spatial_block += 128
                
                # Place block in reconstructed image
                reconstructed[by:by+8, bx:bx+8] = spatial_block
        
        # Clip values to valid range [0, 255]
        reconstructed = np.clip(reconstructed, 0, 255).astype(np.uint8)
        
        # Convert grayscale to RGB for model compatibility
        rgb_image = np.stack([reconstructed] * 3, axis=-1)
        
        # Save as PNG
        img = Image.fromarray(rgb_image, mode='RGB')
        img.save(output_path)
        
        logging.info(f"Successfully decompressed {dctrle_path} to {output_path}")
        return True
        
    except Exception as e:
        logging.error(f"Failed to decompress {dctrle_path}: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def extract_and_decompress_zip(zip_path, temp_dir):
    """
    Extract zip file and decompress .dctrle files to PNG images.
    """
    decompressed_files = []
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            file_list = zip_ref.namelist()
            logging.info(f"Files in zip: {file_list}")
            
            for file_name in file_list:
                if file_name.lower().endswith(".dctrle"):
                    # Extract the .dctrle file
                    compressed_path = zip_ref.extract(file_name, temp_dir)
                    
                    # Create output path for decompressed PNG
                    base_name = os.path.splitext(os.path.basename(file_name))[0]
                    decompressed_name = f"{base_name}_decompressed.png"
                    decompressed_path = os.path.join(temp_dir, decompressed_name)
                    
                    # Decompress the .dctrle file
                    if decompress_dctrle_image(compressed_path, decompressed_path):
                        decompressed_files.append(decompressed_path)
                    else:
                        logging.error(f"Failed to decompress {file_name}")
                elif file_name.lower().endswith((".png", ".jpg", ".jpeg")):
                    # Handle regular image files (fallback)
                    regular_path = zip_ref.extract(file_name, temp_dir)
                    decompressed_files.append(regular_path)
            
        return decompressed_files, file_list
        
    except Exception as e:
        logging.error(f"Failed to extract and decompress zip: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


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


@app.route("/register", methods=["POST"])
def register():
    username = request.form.get("username")
    zip_file = request.files.get("file")

    if not username or not zip_file:
        return jsonify({"success": False, "error": "Missing username or file"}), 404

    temp_dir = tempfile.mkdtemp()
    zip_path = os.path.join(temp_dir, "images.zip")
    zip_file.save(zip_path)

    try:
        # Use custom extraction and decompression
        decompressed_files, file_list = extract_and_decompress_zip(zip_path, temp_dir)

        embeddings = []
        for img_path in decompressed_files:
            try:
                img = preprocess_image(img_path)
                embedding = embedding_model.predict(img)
                if isinstance(embedding, list):
                    embedding = embedding[0]
                embedding = embedding.flatten()
                embeddings.append(embedding)
            except Exception as e:
                logging.error(f"Failed to process image '{img_path}': {str(e)}")

        if not embeddings:
            return jsonify({"success": False, "error": "No valid images processed", "files_in_zip": file_list}), 400

        avg_embedding = np.mean(embeddings, axis=0).tolist()

        users_collection.update_one(
            {"username": username},
            {"$set": {"userEmbedding": avg_embedding}},
            upsert=True
        )

        logging.info(f"User '{username}' registered successfully with average embedding.")
        return jsonify({"success": True, "files_in_zip": file_list}), 200

    except Exception as e:
        logging.error(f"Registration failed: {str(e)}")
        return jsonify({"success": False, "error": "Server error"}), 500

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")
    zip_file = request.files.get("file")

    if not username or not zip_file:
        return jsonify({"success": False, "error": "Missing username or file"}), 400

    user = users_collection.find_one({"username": username})
    if not user or "userEmbedding" not in user:
        return jsonify({"success": False, "error": "User not found"}), 404

    temp_dir = tempfile.mkdtemp()
    zip_path = os.path.join(temp_dir, "login_image.zip")
    zip_file.save(zip_path)

    try:
        # Extract and decompress the zip file
        decompressed_files, file_list = extract_and_decompress_zip(zip_path, temp_dir)
        
        if not decompressed_files:
            return jsonify({"success": False, "error": "No valid images in zip"}), 400
        
        # Use the first image for authentication
        img_path = decompressed_files[0]
        
        try:
            img = preprocess_image(img_path)
            new_embedding = embedding_model.predict(img)
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

    except Exception as e:
        logging.error(f"Login failed: {str(e)}")
        return jsonify({"success": False, "error": "Server error"}), 500

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


if __name__ == "__main__":
    app.run(debug=True)