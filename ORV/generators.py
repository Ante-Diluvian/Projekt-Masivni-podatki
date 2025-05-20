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
        pass

    def __getitem__(self, idx):
        #Generate one batch of data
        pass
    
    def on_epoch_end(self):
        #Updates the indexes after each epoch
        pass

    def load_image(self, path):
        #Load and preprocess the image
        pass
    
    def augment_image(self, img):
        #Apply data augmentation to the image
        pass