import os
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split

import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.losses import SparseCategoricalCrossentropy

from generators import ImageDataGenerator
from utils import load_images_and_labels  # že posodobljena verzija z TOP_K_CLASSES

# HYPERPARAMETRI
DATA_DIR       = "dataset/train"
BATCH_SIZE     = 32
IMAGE_SIZE     = (112, 112)
EPOCHS         = 15
LEARNING_RATE  = 1e-5
AUGMENT        = True

def plot_history(history):
    plt.figure(figsize=(12,5))
    plt.subplot(1,2,1)
    plt.plot(history.history['accuracy'], label='Train Accuracy')
    plt.plot(history.history['val_accuracy'], label='Val Accuracy')
    plt.legend()
    plt.title("Accuracy")

    plt.subplot(1,2,2)
    plt.plot(history.history['loss'], label='Train Loss')
    plt.plot(history.history['val_loss'], label='Val Loss')
    plt.legend()
    plt.title("Loss")

    os.makedirs("model", exist_ok=True)
    plt.tight_layout()
    plt.savefig("model/history.png")

def train():
    tf.random.set_seed(42)
    np.random.seed(42)

    #Load images and labels
    image_paths, labels, class_names = load_images_and_labels(DATA_DIR)

    train_p, val_p, train_l, val_l = train_test_split(
        image_paths, labels, test_size=0.2, stratify=labels, random_state=42
    )

    train_gen = ImageDataGenerator(train_p, train_l, batch_size=BATCH_SIZE, image_size=IMAGE_SIZE, shuffle=True, augment=AUGMENT)
    val_gen = ImageDataGenerator(val_p, val_l, batch_size=BATCH_SIZE, image_size=IMAGE_SIZE, shuffle=False, augment=False)

    #Create the model
    base = tf.keras.applications.MobileNetV2(
        input_shape=(*IMAGE_SIZE, 3),
        include_top=False,
        weights='imagenet',
        pooling='avg'
    )
    base.trainable = False

    #Add custom layers
    x = base.output
    embedding = layers.Dense(128, activation='relu')(x)
    output = layers.Dense(len(class_names), activation='softmax')(embedding)
    model = models.Model(inputs=base.input, outputs=output)

    #Compile the model
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE),
        loss=SparseCategoricalCrossentropy(),
        metrics=['accuracy']
    )

    #Create callbacks for saving the best model and early stopping
    callbacks = [
        tf.keras.callbacks.ModelCheckpoint("model/best_model.keras", save_best_only=True, monitor='val_accuracy', mode='max'),
        tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True)
    ]

    #Train the model, save training history
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS,
        callbacks=callbacks
    )

    #Save the final model and plot training history
    model.save("model/final_model.keras")
    plot_history(history)

if __name__ == "__main__":
    train()
