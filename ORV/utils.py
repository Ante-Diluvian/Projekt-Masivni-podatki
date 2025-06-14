import os
import tensorflow as tf
import numpy as np
import cv2 as cv
from params import IMG_SIZE, MAX_IMAGES, MIN_IMAGES, MAX_PEOPLE
from augmentacija import rotate_img, change_brightness, mirror_img, move_img, filter_with_gausso_core

#Get image file paths and numeric labels from the dataset directory
def get_image_paths_and_labels(root_dir):
    classes = sorted([d for d in os.listdir(root_dir) if os.path.isdir(os.path.join(root_dir, d))])  #Get sorted list of class folders

    filtered_classes = []                                               #List of class names that meet image count criteria
    class_image_dict = {}                                               #Dictionary to store filtered image paths per class

    for cls in classes:
        cls_dir = os.path.join(root_dir, cls)                           #Path to class folder
        imgs = [os.path.join(cls_dir, f) for f in os.listdir(cls_dir)
                if f.lower().endswith(('.png', '.jpg', '.jpeg'))]

        if MIN_IMAGES <= len(imgs) <= MAX_IMAGES:
            class_image_dict[cls] = imgs
            filtered_classes.append(cls)

    #Limit number of classes to MAX_PEOPLE
    max_classes = min(len(filtered_classes), MAX_PEOPLE)
    selected_classes = filtered_classes[:max_classes]                   #Take only the first N classes

    all_paths = []
    all_labels = []
    classes_final = []

    for idx, cls in enumerate(selected_classes):
        imgs = class_image_dict[cls]
        all_paths.extend(imgs)
        all_labels.extend([idx] * len(imgs))
        classes_final.append(cls)

    return all_paths, all_labels, classes_final  #Return final filtered paths, labels, class names


#Custom augmentation
def custom_augment(img):
    img = rotate_img(img, angle=np.random.uniform(-20, 20))                             #Random rotation
    img = change_brightness(img, factor=np.random.uniform(-40, 40))                     #Random brightness
    img = mirror_img(img) if np.random.rand() > 0.5 else img                            #Random horizontal flip
    img = move_img(img, x=np.random.randint(-10, 10), y=np.random.randint(-10, 10))     #Random translation
    img = filter_with_gausso_core(img, sigma=np.random.uniform(0.5, 1.5))               #Optional blur
    return img

#Load and preprocess a single image
def parse_and_preprocess(path, label, augment=False):
    def _load_and_preprocess(path_str):
        img = cv.imread(path_str.decode(), cv.IMREAD_COLOR)     #Read with OpenCV
        img = cv.resize(img, IMG_SIZE)                          #Resize to target size

        if augment:
            img = custom_augment(img)                           #Apply custom augmentation

        img = img.astype(np.float32)
        img = tf.keras.applications.mobilenet_v2.preprocess_input(img)  #Normalize for MobileNetV2
        return img

    img = tf.py_function(func=_load_and_preprocess, inp=[path], Tout=tf.float32)
    img.set_shape((*IMG_SIZE, 3))  #Set shape back to original size
    return img, label

#Build a Dataset pipeline
def make_dataset(paths, labels, augment=False, batch_size=32):
    ds = tf.data.Dataset.from_tensor_slices((paths, labels))        #Create dataset from paths and labels
    if augment:
        ds = ds.shuffle(buffer_size=len(paths))                     #Shuffle data if augmenting
    ds = ds.map(lambda p, y: parse_and_preprocess(p, y, augment),
                num_parallel_calls=tf.data.AUTOTUNE)                #Parse and preprocess images in parallel
    ds = ds.batch(batch_size).prefetch(tf.data.AUTOTUNE)            #Batch and prefetch for performance
    return ds                                                       #Return dataset