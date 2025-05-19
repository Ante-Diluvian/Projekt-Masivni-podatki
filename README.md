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
- **Zajem senzorjev** (npr. kamera za prepoznavo obraza)
- Podpora za **biometrično prijavo** kot del 2FA (npr. Face ID)

## 🔐 2FA mehanizem

- Uporabnik se prijavi v spletno aplikacijo
- Na mobilni napravi se sproži zahteva za **biometrično potrditev (prepoznava obraza)**
- Po uspešni potrditvi je dostop do React spletne aplikacije omogočen

## ⚙️ Tehnologije

- **Node.js / Express**
- **React / React Native**
- **Python (Face Recognition)**
- **Scraper (npr. cheerio ali puppeteer)**

## 📁 Struktura projekta

/RAIN/backend # Express API + scraper
/RAIN/frontend # React aplikacija
/NPO # React Native aplikacija
