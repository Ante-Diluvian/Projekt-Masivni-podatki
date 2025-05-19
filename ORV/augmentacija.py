import cv2 as cv
import numpy as np
import math

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

if __name__ == "__main__":
    slika = procesiraj_sliko("test/clovek.jpg")
    slika = cv.resize(slika,(500,700))
    slika = filtriraj_z_gaussovim_jedrom(slika,5)
    if slika is None:
        print("Napaka: Slika ni bila naloÅ¾ena. Preveri pot do slike.")
    else:
        while True:  
            cv.imshow('Slika', slika.astype(np.uint8))
            if cv.waitKey(1) & 0xFF == ord('q'):
                break

cv.waitKey(0)
cv.destroyAllWindows()