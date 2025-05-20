import tensorflow as tf
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

    #5.Compile the model
    model.compile(optimizer=optimizer, loss='sparse_categorical_crossentropy', metrics=['accuracy'])

    #6.Train the model
    history = model.fit(train_gen, validation_data=val_gen, epochs=EPOCHS, verbose=1)

    #7.Save the model
    model.save('model/modelFR.keras')
    pass

if __name__ == "__main__":
    train()