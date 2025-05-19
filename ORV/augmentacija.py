import cv2 as cv
import numpy as np
import math

#region Priprava podatkov
def procesiraj_sliko(pot):
    slika = cv.imread(pot)
    sivinska_slika = cv.cvtColor(slika, cv.COLOR_BGR2GRAY)
    return sivinska_slika
    pass

def konvolucija(slika, jedro):
    visina, sirina = slika.shape
    j_visina, j_sirina = jedro.shape

    pad_v = j_visina // 2
    pad_s = j_sirina // 2
      
    
    razsirjena_slika = np.pad(slika, ((pad_v, pad_v), (pad_s, pad_s)))
    filtrirano = np.zeros_like(slika, dtype=np.float32)
    for i in range(visina):
        for j in range(sirina):
            filtrirano[i, j] = np.sum(razsirjena_slika[i:i+j_visina, j:j+j_sirina] * jedro)
    
    return filtrirano
    pass

def filtriraj_z_gaussovim_jedrom(slika,sigma):
    velikost_jedra = (int)(2 * sigma) * 2 + 1  
    k = (velikost_jedra / 2) - (1/2)
  
    jedro = np.zeros((velikost_jedra, velikost_jedra), dtype=np.float32)
    for i in range(velikost_jedra):
        for j in range(velikost_jedra):
            jedro[i,j] = (1 / (2 * math.pi * math.pow(sigma, 2)) * math.exp(-(math.pow((i - k - 1), 2) + math.pow((j - k - 1), 2)) / (2 * math.pow(sigma, 2))))
  
    jedro /= np.sum(jedro)
    return konvolucija(slika,jedro)
    pass

def lineariziraj_sivine(slika):
    min_val = np.min(slika)
    max_val = np.max(slika)

    linearizirana = (slika - min_val) / (max_val - min_val) * 255
    return linearizirana.astype(np.uint8)
#endregion

#region Augmentacija podatkov
def rotiraj_slika(slika, kot):
    radiani = math.radians(kot)
    rotirana_slika = np.zeros(slika.shape, dtype=np.uint8)
    height, width = slika.shape

    x = width // 2
    y = height // 2
    for i in range(height):
        for j in range(width):
            x1 = (j - x) * math.cos(radiani) - (i - y) * math.sin(radiani)
            y1 = (j - x) * math.sin(radiani) + (i - y) * math.cos(radiani)

            x1 = round(x1 + x)
            y1 = round(y1 + y)

            if 0 <= x1 < width and 0 <= y1 < height:
                rotirana_slika[i, j] = slika[y1, x1]

    return rotirana_slika
    pass
#endregion

if __name__ == "__main__":
    slika = procesiraj_sliko("test/clovek.jpg")
    slika = cv.resize(slika,(500,700))
    slika = filtriraj_z_gaussovim_jedrom(slika,2)
    slika = lineariziraj_sivine(slika)
    rot_slika = rotiraj_slika(slika,-180)
    if slika is None:
        print("Napaka: Slika ni bila naloÅ¾ena. Preveri pot do slike.")
    else:
        while True:  
            cv.imshow('Slika', slika.astype(np.uint8))
            cv.imshow('Rot Slika', rot_slika)
            if cv.waitKey(1) & 0xFF == ord('q'):
                break

cv.waitKey(0)
cv.destroyAllWindows()