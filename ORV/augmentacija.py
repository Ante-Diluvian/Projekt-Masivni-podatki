import cv2 as cv
import numpy as np

if __name__ == "__main__":
    slika = cv.imread('test/clovek.jpg')
    slika = cv.resize(slika,(500,700))
    if slika is None:
        print("Napaka: Slika ni bila naloÅ¾ena. Preveri pot do slike.")
    else:
        while True:  
            cv.imshow('Slika', slika)
            if cv.waitKey(1) & 0xFF == ord('q'):
                break

cv.waitKey(0)
cv.destroyAllWindows()