import os
from collections import Counter

MIN_IMAGES_PER_CLASS = 100
TOP_K_CLASSES = 10          #Only 10 classes with the most images will be used

def load_images_and_labels(dataset_dir):
    class_image_paths = {}
    
    #Walk through the dataset directory and collect image paths
    for class_name in sorted(os.listdir(dataset_dir)):
        class_dir = os.path.join(dataset_dir, class_name)
        if not os.path.isdir(class_dir):
            continue

        image_files = [
            os.path.join(class_dir, filename)
            for filename in os.listdir(class_dir)
            if filename.lower().endswith((".ppm", ".png", ".jpg", ".jpeg"))
        ]

        if len(image_files) >= MIN_IMAGES_PER_CLASS:
            class_image_paths[class_name] = image_files

    #Keep only the top K classes with the most images
    sorted_classes = sorted(class_image_paths.items(), key=lambda item: len(item[1]), reverse=True)
    selected_classes = sorted_classes[:TOP_K_CLASSES]

    image_paths = []
    labels = []
    class_names = [name for name, _ in selected_classes]
    class_to_idx = {name: idx for idx, name in enumerate(class_names)}

    for class_name, files in selected_classes:
        image_paths.extend(files)
        labels.extend([class_to_idx[class_name]] * len(files))

    return image_paths, labels, class_names
