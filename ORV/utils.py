import os

#Load images and labels from dataset
def load_images_and_labels(dataset_dir):
    class_names = sorted(os.listdir(dataset_dir))
    image_paths = []
    labels = []

    for label, class_name in enumerate(class_names):
        class_dir = os.path.join(dataset_dir, class_name)
        if not os.path.isdir(class_dir):
            continue
        for filename in os.listdir(class_dir):
            if filename.endswith((".ppm", ".png", ".jpg", ".jpeg")):
                image_paths.append(os.path.join(class_dir, filename))
                labels.append(label)

    return image_paths, labels, class_names