# CryptoWatch

Application React pour suivre les cours des principales cryptomonnaies en temps réel.

## Fonctionnalités

- Affichage des 50 premières cryptomonnaies par capitalisation boursière
- Filtre automatique des stablecoins
- Ticker animé des meilleures performances (24h)
- Ticker des actions tech majeures (xStocks via CoinGecko)
- Auto-refresh automatique (60s par défaut)
- Graphique 7 jours au survol des cartes (Chart.js)
- Images locales pour les cryptos et xStocks
- Mise à jour automatique des images (hebdomadaire)
- Cache API 60s pour éviter le rate limiting
- Actualisation manuelle des données

## Stack technique

- **React 18** avec hooks
- **Vite** pour le build et le dev server
- **Chart.js** pour les graphiques
- **CoinGecko API** pour les données en temps réel

## Installation

```bash
npm install
```

## Démarrage

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## Configuration

Les paramètres suivants peuvent être modifiés dans `src/core/constants.js` :

```javascript
export const REFRESH_INTERVAL = 60; // intervalle auto-refresh en secondes
export const CACHE_TTL = 60;        // durée du cache API en secondes
```

## Structure du projet

```
src/
├── core/           # Logique métier
│   ├── api.js     # Appels API
│   ├── constants.js # Configuration
│   ├── imageCache.js # Cache des images
│   ├── cryptoImages.json # URLs des images cryptos
│   └── utils.js   # Utilitaires
├── components/     # Composants React
└── styles/        # Fichiers CSS

public/
└── images/        # Images locales
    ├── cryptos/   # Logos des cryptos
    └── xstocks/   # Logos des actions

scripts/
└── refreshImages.py # Script de mise à jour des images
```

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarrer le serveur de développement |
| `npm run build` | Build pour la production |
| `npm run preview` | Prévisualiser le build production |

## Mise à jour des images

Les images sont automatiquement mises à jour une fois par semaine via le script :

```bash
python3 scripts/refreshImages.py
```

Pour forcer la mise à jour :

```bash
python3 scripts/refreshImages.py --force
```
