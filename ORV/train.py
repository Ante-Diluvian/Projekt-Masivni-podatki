import tensorflow as tf
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from utils import load_images_and_labels
from generators import ImageDataGenerator
from models import build_model
from tensorflow.keras.optimizers import Adam

DATASET_DIR = 'dataset'
BATCH_SIZE = 32
IMG_SIZE = (128, 128)
EPOCHS = 10
optimizer = Adam(learning_rate=1e-4)

def plot_history(history):
    plt.figure(figsize=(12, 5))

    #Accuracy
    plt.subplot(1, 2, 1)
    plt.plot(history.history['accuracy'], label='Train Accuracy')
    plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
    plt.title('Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()

    #Loss
    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'], label='Train Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()

    plt.tight_layout()
    plt.savefig(f"model/history.png")

def train():
    #1.Load images and labels
    image_paths, labels, class_names = load_images_and_labels(DATASET_DIR)

    #2.Split data into training and validation sets
    train_paths, val_paths, train_labels, val_labels = train_test_split(
        image_paths, labels, test_size=0.2, random_state=42
    )

    #3.Create data generators
    train_gen = ImageDataGenerator(
        train_paths, train_labels, BATCH_SIZE, IMG_SIZE, augment=True
    )

    val_gen = ImageDataGenerator(
        val_paths, val_labels, BATCH_SIZE, IMG_SIZE, augment=False
    )

    #4.Build the model
    model = build_model(input_shape=(128, 128, 3), base_channels=32, num_classes=len(class_names))

    #4.1.Model summary
    with open("model/summary.txt", "w") as f:
        model.summary(print_fn=lambda x: f.write(x + "\n"))

    #5.Compile the model
    model.compile(optimizer=optimizer, loss='sparse_categorical_crossentropy', metrics=['accuracy'])

    #6.Train the model
    history = model.fit(train_gen, validation_data=val_gen, epochs=EPOCHS, verbose=1)

    #7.Save the model
    model.save('model/modelFR.keras')

    #8.Plot training history 
    plot_history(history)

if __name__ == "__main__":
    train()