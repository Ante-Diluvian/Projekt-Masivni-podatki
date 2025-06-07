import os
import numpy as np
import cv2 as cv
import tensorflow as tf

from sklearn.model_selection import train_test_split
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, TensorBoard

from model import build_model                                   #Function that builds and returns the model
from utils import make_dataset, get_image_paths_and_labels      #Custom utility functions
from params import BATCH_SIZE, EPOCHS, IMG_SIZE                 #Training parameters

def train(data_root):
    #1. Load all image paths, labels, and the list of class names
    all_paths, all_labels, classes = get_image_paths_and_labels(data_root)

    #2. Split the data into training and validation sets (80/20 split)
    train_paths, val_paths, train_labels, val_labels = train_test_split(
        all_paths, all_labels, test_size=0.2, random_state=42, stratify=all_labels
    )

    #3. Create TensorFlow datasets for training and validation
    train_ds = make_dataset(train_paths, train_labels, augment=True, batch_size=BATCH_SIZE)
    val_ds = make_dataset(val_paths, val_labels, augment=False, batch_size=BATCH_SIZE)

    #4. Build the model
    model = build_model(num_classes=len(classes), input_shape=(*IMG_SIZE, 3))

    #5. Create output directories if they don't exist
    os.makedirs('logs', exist_ok=True)
    os.makedirs('model_summary', exist_ok=True)
    os.makedirs('model', exist_ok=True)

    #6. Save model summary to a text file
    with open('model_summary/model_summary.txt', 'w') as f:
        model.summary(print_fn=lambda x: f.write(x + '\n'))

    #7. Define training callbacks:
    #- Save the best model based on validation loss
    checkpoint = ModelCheckpoint(
        filepath='model/mobilefacenet_best.keras',
        save_best_only=True,
        monitor='val_loss'
    )

    #- Stop training early if validation loss doesn't improve
    earlystop = EarlyStopping(
        monitor='val_loss',
        patience=5,
        restore_best_weights=True
    )

    #- Log training progress for TensorBoard visualization
    tensorboard = TensorBoard(
        log_dir='logs',
        write_graph=True,
        histogram_freq=1
    )

    #8. Train the model
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=[checkpoint, earlystop, tensorboard]
    )

    #9. Save the final trained model
    model.save('model/final_mobilefacenet.keras')

    #10. Save an embedding-only version of the model for feature extraction
    embedding_model = tf.keras.Model(
        inputs=model.input,
        outputs=model.get_layer('embedding').output
    )
    embedding_model.save('model/embedding_model.keras')


#11. Run training
if __name__ == '__main__':
    train('dataset/data')
