import numpy as np
import cv2 as cv
import tensorflow as tf
import random

from tensorflow.keras.utils import Sequence

from augmentacija import process_img, filter_with_gausso_core, linearize_img, rotate_img, change_brightness, mirror_img, move_img

class ImageDataGenerator(tf.keras.utils.Sequence):
    def __init__(self, image_paths, labels, batch_size=32, image_size=(128, 128), shuffle=True, augment=False):
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

    def augment_image(self, img):
        #Apply data augmentation to the image
        if random.random() < 0.3:
            img = rotate_img(img, random.randint(-25, 25))
        if random.random() < 0.3:
            img = change_brightness(img, random.randint(-50, 50))
        if random.random() < 0.2:
            img = mirror_img(img)
        if random.random() < 0.3:
            img = move_img(img, random.randint(-15, 15), random.randint(-15, 15))
        if random.random() < 0.2:
            img = filter_with_gausso_core(img, sigma=1.5)
        if random.random() < 0.2:
            img = linearize_img(img)
        
        return img