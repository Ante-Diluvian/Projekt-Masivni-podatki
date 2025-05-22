import cv2 as cv
import numpy as np
import math

#region Zajem podatkov
#endregion

#region Priprava podatkov
def process_img(img):
    proc_img = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    return proc_img

def convolution(img, core):
    height, width = img.shape[:2]
    j_height, j_width = core.shape

    pad_v = j_height // 2
    pad_s = j_width // 2

    if img.ndim == 2:
        # Grayscale slika
        expanded_image = np.pad(img, ((pad_v, pad_v), (pad_s, pad_s)), mode='constant')
        filtrated = np.zeros_like(img, dtype=np.float32)

        for i in range(height):
            for j in range(width):
                region = expanded_image[i:i + j_height, j:j + j_width]
                filtrated[i, j] = np.sum(region * core)

    elif img.ndim == 3:
        # RGB slika
        expanded_image = np.pad(img, ((pad_v, pad_v), (pad_s, pad_s), (0, 0)), mode='constant')
        filtrated = np.zeros_like(img, dtype=np.float32)

        for c in range(img.shape[2]):
            for i in range(height):
                for j in range(width):
                    region = expanded_image[i:i + j_height, j:j + j_width, c]
                    filtrated[i, j, c] = np.sum(region * core)

    else:
        raise ValueError("Slika mora biti 2D (grayscale) ali 3D (RGB)")

    return filtrated

def filter_with_gausso_core(img, sigma):
    size_of_the_core = int(2 * sigma) * 2 + 1
    k = (size_of_the_core / 2) - (1 / 2)

    core = np.zeros((size_of_the_core, size_of_the_core), dtype=np.float32)
    for i in range(size_of_the_core):
        for j in range(size_of_the_core):
            core[i, j] = (1 / (2 * math.pi * sigma ** 2)) * math.exp(
                -((i - k - 1) ** 2 + (j - k - 1) ** 2) / (2 * sigma ** 2)
            )

    core /= np.sum(core)
    return convolution(img, core)

def linearize_img(img):
    min_val = np.min(img)
    max_val = np.max(img)

    if max_val - min_val == 0:
        return np.zeros_like(img, dtype=np.uint8)

    linearized = (img - min_val) / (max_val - min_val) * 255
    return linearized.astype(np.uint8)
#endregion

#region Augmentacija podatkov
def rotate_img(img, angle):
    radian = math.radians(angle)
    rotated_img = np.zeros_like(img)
    height, width = img.shape[:2]

    cx = width // 2
    cy = height // 2

    for i in range(height):
        for j in range(width):
            x_shifted = j - cx
            y_shifted = i - cy

            x_rot = x_shifted * math.cos(radian) - y_shifted * math.sin(radian)
            y_rot = x_shifted * math.sin(radian) + y_shifted * math.cos(radian)

            x_new = round(x_rot + cx)
            y_new = round(y_rot + cy)

            if 0 <= x_new < width and 0 <= y_new < height:
                rotated_img[i, j] = img[y_new, x_new]

    return rotated_img

def change_brightness(img, factor):
    brightness_image = img.astype(np.float32) + factor
    brightness_image = np.clip(brightness_image, 0, 255)
    return brightness_image.astype(np.uint8)

def mirror_img(img):
    return np.fliplr(img)

def move_img(img, x, y):
    height, width = img.shape[:2]
    moved_img = np.zeros_like(img)

    for i in range(height):
        for j in range(width):
            new_i = i - y
            new_j = j - x

            if 0 <= new_i < height and 0 <= new_j < width:
                moved_img[i, j] = img[new_i, new_j]

    return moved_img
#endregion

#region 2FA
#endregion

if __name__ == "__main__":
    pass
