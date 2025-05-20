import tensorflow as tf

from tensorflow.keras import layers, models

def build_model(input_shape=(128, 128, 3), base_channels=32, num_classes=43):
    model = models.Sequential()
    N = base_channels

    for i in range(3):
        model.add(layers.Conv2D(N, (3, 3), padding='same', input_shape=input_shape if i == 0 else None))
        model.add(layers.ReLU())
        model.add(layers.Conv2D(N, (3, 3), strides=2, padding='same'))
        model.add(layers.ReLU())
        N *= 2

    model.add(layers.Flatten())
    model.add(layers.Dense(128, activation='relu'))
    model.add(layers.Dropout(0.5))
    model.add(layers.Dense(num_classes, activation='softmax'))

    return model