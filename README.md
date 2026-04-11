# CryptoWatch

Application React pour suivre les cours des principales cryptomonnaies en temps réel.

## Fonctionnalités

- Affichage des 50 premières cryptomonnaies par capitalisation boursière
- Filtre automatique des stablecoins
- Ticker animé des meilleures performances (24h)
- Ticker des actions tech majeures (xStocks via CoinGecko)
- Auto-refresh automatique (60s par défaut)
- Graphique 24h au survol des cartes (Chart.js)
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

L'intervalle d'actualisation automatique peut être modifié dans `src/core/constants.js` :

```javascript
export const REFRESH_INTERVAL = 60; // en secondes
```

## Structure du projet

```
src/
├── core/           # Logique métier
│   ├── api.js     # Appels API
│   ├── constants.js # Configuration
│   └── utils.js   # Utilitaires
├── components/     # Composants React
└── styles/        # Fichiers CSS
```

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarrer le serveur de développement |
| `npm run build` | Build pour la production |
| `npm run preview` | Prévisualiser le build production |
