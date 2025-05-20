import numpy as np
import cv2 as cv
import tensorflow as tf
import random

from tensorflow.keras.utils import Sequence

from augmentacija import process_img, filter_with_gausso_core, linearize_img, rotate_img

class ImageDataGenerator(tf.keras.utils.Sequence):
    def __init__(self, image_paths, labels, batch_size=32, image_size=(64, 64), shuffle=True, augment=False):
        #Initialize the data generator
        self.image_paths = image_paths
        self.labels = labels
        self.batch_size = batch_size
        self.image_size = image_size
        self.shuffle = shuffle
        self.augment = augment
        self.on_epoch_end()

    def __len__(self):
        #Return the number of batches per epoch
        return int(np.ceil(len(self.image_paths) / self.batch_size))

    def __getitem__(self, idx):
        #Generate one batch of data
        batch_x = self.image_paths[idx * self.batch_size:(idx + 1) * self.batch_size]
        batch_y = self.labels[idx * self.batch_size:(idx + 1) * self.batch_size]
        
        images = []
        for path in batch_x:
            img = cv.imread(path)
            img = process_img(img)
            img = cv.resize(img, self.image_size)
            img = img.astype(np.float32) / 255.0

            if self.augment:
                img = self.augment_image(img)

            images.append(img)
        
        return np.array(images), np.array(batch_y)
    
    def on_epoch_end(self):
        #Updates the indexes after each epoch
        if self.shuffle:
            indices = np.arange(len(self.image_paths))
            np.random.shuffle(indices)
            self.image_paths = [self.image_paths[i] for i in indices]
            self.labels = [self.labels[i] for i in indices]

    def load_image(self, path):
        #Load and preprocess the image
        pass
    
    def augment_image(self, img):
        #Apply data augmentation to the image
        pass