import cv2 as cv
import numpy as np
import math

#region Zajem podatkov

#endregion

#region Priprava podatkov
def process_img(img):
    gray_img = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    return gray_img
    pass

def convolution(img, core):
    height, width = img.shape
    j_height, j_width = core.shape

    pad_v = j_height // 2
    pad_s = j_width // 2
      
    
    expanded_image = np.pad(img, ((pad_v, pad_v), (pad_s, pad_s)))
    filtrated = np.zeros_like(img, dtype=np.float32)
    for i in range(height):
        for j in range(width):
            filtrated[i, j] = np.sum(expanded_image[i:i+j_height, j:j+j_width] * core)
    
    return filtrated
    pass

def filter_with_gausso_core(img,sigma):
    size_of_the_core = (int)(2 * sigma) * 2 + 1  
    k = (size_of_the_core / 2) - (1/2)
  
    core = np.zeros((size_of_the_core, size_of_the_core), dtype=np.float32)
    for i in range(size_of_the_core):
        for j in range(size_of_the_core):
            core[i,j] = (1 / (2 * math.pi * math.pow(sigma, 2)) * math.exp(-(math.pow((i - k - 1), 2) + math.pow((j - k - 1), 2)) / (2 * math.pow(sigma, 2))))
  
    core /= np.sum(core)
    return convolution(img,core)
    pass

def linearize_img(img):
    min_val = np.min(img)
    max_val = np.max(img)

    linearized = (img - min_val) / (max_val - min_val) * 255
    return linearized.astype(np.uint8)
#endregion

#region Augmentacija podatkov
def rotate_img(img, angle):
    radian = math.radians(angle)
    rotated_img = np.zeros(img.shape, dtype=np.uint8)
    height, width = img.shape

    x = width // 2
    y = height // 2
    for i in range(height):
        for j in range(width):
            x1 = (j - x) * math.cos(radian) - (i - y) * math.sin(radian)
            y1 = (j - x) * math.sin(radian) + (i - y) * math.cos(radian)

            x1 = round(x1 + x)
            y1 = round(y1 + y)

            if 0 <= x1 < width and 0 <= y1 < height:
                rotated_img[i, j] = img[y1, x1]

    return rotated_img
    pass

def change_brightness(img, factor):
    brightness_image = img.astype(np.float32) + factor
    brightness_image = np.clip(brightness_image, 0, 255)
    return brightness_image.astype(np.uint8)
    pass

def mirror_img(img):
    height,width = img.shape
    copy_img = img.copy()

    for i in range(height):
       for j in range(width):
           copy_img[i,width - j - 1] = img[i,j]

    return copy_img
    pass

def move_img(img, x, y):
    height,width = img.shape
    move = np.zeros_like(img)
    for i in range(height):
        for j in range(width):
            new_i = i - y
            new_j = j - x

            if 0 <= new_i < height and 0 <= new_j < width:
                move[i, j] = img[new_i, new_j]

    return move

    pass
#endregion

#region 2FA

#endregion

if __name__ == "__main__":
    slika = cv.imread("test/clovek2.jpg")
    slika = process_img(slika)
    slika = cv.resize(slika,(300,500))
    slika = filter_with_gausso_core(slika,2)
    slika = linearize_img(slika)

    rot_slika = rotate_img(slika,45)
    svetlost_slike = change_brightness(slika,100)
    zrcali_sliko = mirror_img(slika)
    slika1 = move_img(slika,50,-50)

    if slika is None:
        print("Napaka: Slika ni bila naloÅ¾ena. Preveri pot do slike.")
    else:
        while True:  
            cv.imshow('Slika', slika.astype(np.uint8))
            cv.imshow('Rot Slika', rot_slika)
            cv.imshow('Svetla slika', svetlost_slike)
            cv.imshow("zrcali", zrcali_sliko)
            cv.imshow("move image", slika1)
            if cv.waitKey(1) & 0xFF == ord('q'):
                break

cv.waitKey(0)
cv.destroyAllWindows()