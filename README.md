# CryptoWatch

> **Suivez les cours des principales cryptomonnaies et des indices boursiers en temps réel.**

Application React moderne avec dashboard crypto, page Bourse (indices & actions tech), mode sombre, PWA, et déploiement Vercel.

![Version](https://img.shields.io/github/package-json/v/JonathanMortier/webcrypto/main?label=version&color=1a1a2e) ![React](https://img.shields.io/badge/React-19-61dafb) ![Vite](https://img.shields.io/badge/Vite-8-646cff)

---

## Fonctionnalités

### Cryptomonnaies
| | |
|---|---|
| **Top 50 crypto** | Classement par capitalisation boursière (CoinGecko) |
| **Filtre stablecoins** | USDT, USDC, DAI, et +20 autres automatiquement masqués |
| **Ticker animé** | Meilleures performances 24h en défilement |
| **Graphique interactif** | Chart.js au survol (1h, 24h, 7j, 30j, 1an) |
| **Favoris** | Étoile + filtre dans le header, persistés en localStorage |
| **Recherche** | Par nom ou symbole, raccourci clavier `F` |
| **Indicateurs marché** | Market Cap, Volume 24h, BTC/ETH Dominance, Altcoin Season Index |
| **Fear & Greed Index** | Indice de sentiment du marché (Alternative.me) |
| **Alertes de prix** | Notifications navigateur quand une crypto favorite varie de ±5% |

### Bourse & Indices
| | |
|---|---|
| **Indices temps réel** | S&P 500, Nasdaq 100, Euro Stoxx 600, MSCI World via Yahoo Finance |
| **Actions tech** | Apple, Microsoft, Alphabet, Amazon, Meta, Nvidia, Tesla (xStocks) |
| **Suivi de portefeuille** | Saisie des unités et prix moyen, calcul automatique des gains/pertes |

### Interface
| | |
|---|---|
| **Navigation** | Menu hamburger avec pages CryptoWatch / Bourse |
| **Thème sombre/clair** | Toggle persisté en localStorage, raccourci `T` |
| **PWA** | Installation sur mobile (homescreen) |
| **Raccourcis clavier** | `R` refresh, `F` recherche, `T` thème |
| **Responsive** | Adaptation mobile/tablette/desktop |

---

## Stack technique

| Technologie | Utilisation |
|---|---|
| **React 19** | Hooks, composants fonctionnels |
| **Vite 8** | Build, dev server HMR, proxy API |
| **Chart.js + react-chartjs-2** | Graphiques de prix interactifs |
| **react-router-dom v7** | HashRouter, routes `/` et `/bourse` |
| **CoinGecko API** | Données cryptos, xStocks, ETFs |
| **Yahoo Finance API** | Cotations indices boursiers |
| **Alternative.me API** | Fear & Greed Index |
| **Vercel Analytics** | Statistiques de visite |
| **Express** | Serveur production local (proxy Yahoo) |

---

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

 accessible sur `http://localhost:5173` — le proxy Vite redirige `/api/yahoo/*` vers Yahoo Finance.

## Production locale

```bash
npm run build && npm start
```

Serveur Express sur `http://localhost:3000` avec proxy Yahoo intégré.

## Production (Vercel)

Déploiement automatique depuis GitHub. La fonction serverless `api/yahoo.js` proxyfe les appels Yahoo Finance.

**URL :** [webcrypto-seven-vercel.app](https://webcrypto-seven-vercel.app/)

---

## Structure du projet

```
webcrypto/
├── api/
│   └── yahoo.js              # Serverless function Vercel (proxy Yahoo Finance)
├── public/
│   └── images/
│       ├── cryptos/           # Logos cryptos (mis à jour hebdo)
│       └── xstocks/           # Logos actions tech
├── scripts/
│   └── refreshImages.py       # Script de mise à jour des images
├── src/
│   ├── core/
│   │   ├── api.js             # Tous les appels API + cache + filtres
│   │   ├── constants.js       # Configuration (API, STABLECOINS, INDICES, etc.)
│   │   ├── imageCache.js      # Gestion du cache images
│   │   ├── cryptoImages.json  # Mapping crypto → image
│   │   └── utils.js           # Fonctions utilitaires
│   ├── components/
│   │   ├── CryptoCard.jsx     # Carte crypto individuelle
│   │   ├── CryptoGrid.jsx     # Grille de cartes avec tri/filtre
│   │   ├── CryptoTicker.jsx   # Bandeau défilant top gainers
│   │   ├── StocksTicker.jsx   # Bandeau défilant actions tech
│   │   ├── Header.jsx         # Header (recherche, favoris, thème, notifs)
│   │   ├── NavMenu.jsx        # Menu hamburger de navigation
│   │   ├── MarketIndicators.jsx # Indicateurs marché + Fear & Greed
│   │   ├── PriceChart.jsx     # Graphique Chart.js interactif
│   │   ├── FearGreedIndex.jsx # Widget Fear & Greed
│   │   ├── InstallPrompt.jsx  # Bannière d'installation PWA
│   │   └── Status.jsx         # Composants Loading / Error
│   ├── pages/
│   │   ├── BoursePage.jsx     # Page Bourse (indices + actions + portefeuille)
│   │   └── EtfPage.jsx        # Page ETFs crypto
│   └── styles/
│       ├── index.css          # Point d'entrée CSS
│       ├── header.css         # NavMenu + Header
│       ├── indices.css        # Page Bourse
│       ├── fearGreed.css      # Fear & Greed
│       ├── cryptoCard.css     # Cartes crypto
│       └── status.css         # Loading / Error
├── server.js                  # Serveur Express production
├── vite.config.js             # Configuration Vite
├── vercel.json                # Configuration Vercel (SPA rewrites)
└── package.json
```

---

## Configuration

Principaux paramètres dans `src/core/constants.js` :

| Constante | Valeur | Description |
|---|---|---|
| `REFRESH_INTERVAL` | 60s | Intervalle de rafraîchissement auto |
| `CACHE_TTL` | 120s | Durée du cache API (CoinGecko) |
| `INDICES` | 4 ETFs | Symboles Yahoo Finance des indices suivis |
| `STABLECOINS` | 22 tokens | Cryptos filtrées automatiquement |
| `XSTOCK_IDS` | 7 actions | Actions tech suivies via xStocks |

---

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement (hot reload) |
| `npm run build` | Build production |
| `npm start` | Serveur Express production (port 3000) |
| `npm run test` | Tests unitaires (Vitest) |
| `npm run test:watch` | Tests en mode watch |

---

## Raccourcis clavier

| Touche | Action |
|--------|--------|
| `R` | Rafraîchir les données |
| `F` | Focus sur la recherche |
| `T` | Basculer thème sombre/clair |

---

## Mise à jour des images

Exécution hebdomadaire automatique. Pour forcer :

```bash
python3 scripts/refreshImages.py --force
```
