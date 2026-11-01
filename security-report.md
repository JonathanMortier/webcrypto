# Rapport de sécurité - CryptoWatch

_Dernier audit : 2026-11-01_

## Corrigé

| Niveau      | Problème                                                                                                                      | Correction                                                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Haut        | XSS : description CoinGecko injectée via `dangerouslySetInnerHTML` sans nettoyage                                             | `sanitizeHtml()` (DOMPurify, balises de mise en forme + liens http(s) uniquement) ; aperçu tronqué en texte brut               |
| Moyen       | CSP avec `script-src 'unsafe-inline'` (dans une balise `<meta>`)                                                              | CSP stricte servie en en-tête HTTP (`vercel.json`, réutilisée par `server.js`), sans `unsafe-inline` pour les scripts          |
| Moyen       | Proxys Vercel ouverts : CORS `*`, tout chemin accepté, `Content-Type` amont relayé, erreurs détaillées                        | `api/_proxy.js` : GET uniquement, liste blanche de chemins, JSON forcé, pas de CORS, message d'erreur générique, limite par IP |
| Moyen       | `server.js` : rate limit et en-têtes de sécurité non appliqués aux proxys                                                     | Middlewares déplacés avant les proxys ; `x-powered-by` désactivé                                                               |
| Bas         | Liens externes issus de l'API sans contrôle de schéma                                                                         | `safeExternalUrl()` (http/https uniquement) ; identifiants encodés                                                             |
| Bas         | Scripts Python : `subprocess` avec `shell=True` et valeurs venant de l'API                                                    | Liste d'arguments sans shell ; validation des id/URL d'images                                                                  |
| Bas         | `coinId` / `categoryId` non encodés dans les URL                                                                              | `encodeURIComponent`                                                                                                           |
| Bas         | Dépendances de dev : `zod` (haut), `colord` (modéré)                                                                          | `npm audit fix`                                                                                                                |
| Moyen       | Clé WeatherAPI exposée dans le bundle (`VITE_WEATHER_API_KEY`) ; pas de restriction par domaine possible sur l'offre gratuite | Proxy serveur `api/weather.js` (clé `WEATHER_API_KEY` côté serveur, coordonnées validées et arrondies, cache edge 10 min)      |
| Fonctionnel | `ip-api.com` en HTTPS réservé à l'offre payante → géolocalisation IP toujours en échec                                        | Remplacé par `ipwho.is` (HTTPS gratuit)                                                                                        |

## Reste à faire (hors code)

- **Clé WeatherAPI** : renommer la variable Vercel `VITE_WEATHER_API_KEY` en `WEATHER_API_KEY`, puis régénérer la clé (l'ancienne a été publique).
- **Rate limit Vercel** : la limite dans `api/_proxy.js` est par instance (mémoire non partagée). Pour une limite stricte, ajouter une règle Vercel Firewall sur `/api/*`.
- **Dépendances de dev** : `deepmerge`, `glob`, `minimatch` (modéré). Seules des corrections `--force` (cassantes) existent ; outils de build/lint uniquement, non livrés.
- **GitHub Actions** : épingler les actions par SHA plutôt que par tag (`@v4`).
