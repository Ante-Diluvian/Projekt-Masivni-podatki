import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image

#Preprocess the image
def preprocess_image(img_path, target_size=(112, 112)):
    img = image.load_img(img_path, target_size=target_size)
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

#Calculate the cosine similarity
def cosine_similarity(a, b):
    return np.dot(a, b.T) / (np.linalg.norm(a) * np.linalg.norm(b))

#Load the images
img1 = preprocess_image("test01.jpg")
img2 = preprocess_image("test02.jpg")

#Load the model and images
embedding_model = tf.keras.models.load_model("model/final_model.keras")
emb1 = embedding_model.predict(img1)
emb2 = embedding_model.predict(img2)

#Calculate the cosine similarity
sim = cosine_similarity(emb1.flatten(), emb2.flatten())

#Print the similarity
print(f"Similarity: {sim}") 
if sim > 0.7:
    print("The images are similar")
else:
    print("The images are not similar")
