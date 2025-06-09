# Projekt-Masivni-podatki

Celovita rešitev, ki vključuje:

## 📦 Backend

- **Node.js + Express** strežnik
- Vgrajen **scraper** za pridobivanje podatkov iz zunanjih virov
- Podpora za **REST API**

## 🌐 Frontend (splet)

- Zgrajen z **React.js**
- Moderno, odzivno uporabniško okolje
- Prijava uporabnika z **2FA (dvofaktorsko avtentikacijo)**

## 📱 Mobilna aplikacija

- Razvita z **React Native**
- Namenjena za Android/iOS
- **Zajem senzorjev** (Accelerometer, gps)
- Podpora za **biometrično prijavo** kot del 2FA

## 🔐 2FA mehanizem

- Uporabnik se prijavi v spletno aplikacijo
- Na mobilni napravi se sproži zahteva za **biometrično potrditev (prepoznava obraza)**
- Po uspešni potrditvi je dostop do React spletne aplikacije omogočen

## ⚙️ Tehnologije

Uporabljene tehnologije in orodja vključujejo:

- **[Node.js](https://nodejs.org/) / [Express](https://expressjs.com/)** – strežnik in REST API  
- **[React](https://react.dev/) / [React Native](https://reactnative.dev/)** – spletna in mobilna aplikacija  
- **[Python](https://www.python.org/downloads/)** – obrazna prepoznava (Face Recognition)  
- **Scraper** – za pridobivanje podatkov iz AllRecipes  

| Jeziki                 | Orodja & Knjižnice                     |
|------------------------|--------------------------------------|
| JavaScript / TypeScript | Node.js, Express, React               |
| Python                 | NumPy, TensorFlow, OpenCV, Pymongo, Flask |
| Ostalo                 | Docker, MongoDB, Shell                 |


## 📁 Struktura projekta

- /RAIN/backend     **Express API + scraper**
- /RAIN/frontend    **React aplikacija**
- /NPO              **React Native aplikacija**
- /ORV **Model za prepoznavo obraza**
---
# Namestitev in zagon projekta

## 1. Predpogoji

Preden začnete, poskrbite, da imate na računalniku nameščeno:

- **Node.js**
- **npm** (priložen z Node.js)  
- **Python 3** (za del z obrazno prepoznavo)  
- **[Git](https://git-scm.com/downloads)** (za kloniranje projekta)  
- Mobilna aplikacija zahteva Android ali iOS napravo z nameščenim razvojnim okoljem **[Expo](https://expo.dev/)**

---

## 2. Kloniranje projekta

Odprite terminal ali ukazno vrstico in vpišite:

```bash
git clone https://github.com/Ante-Diluvian/Projekt-Masivni-podatki
cd Projekt-Masivni-podatki
```

Ustvarite `.env` datoteko v ORV/server ter RAIN/backend in vanjo dodajte povezavo do MongoDB baze:
```bash
cd ORV/server
echo "MONGO_URI=mongodb://<uporabnik>:<geslo>@192.168.1.100:27017/vaša_baza" > .env
#Nadomestite <uporabnik>, <geslo>, IP naslov in ime baze s svojimi podatki

cd RAIN/backend
echo "MONGO_URI=mongodb://<uporabnik>:<geslo>@192.168.1.100:27017/vaša_baza" > .env
#Nadomestite <uporabnik>, <geslo>, IP naslov in ime baze s svojimi podatki
```

Zaženite aplikacijo:
```bash
chmod +x start_app.sh
./start_app.sh
```
