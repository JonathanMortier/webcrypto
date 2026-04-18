# Rapport de Sécurité - CryptoWatch

## ✅ Points Forts

| Domaine | Observation |
|---------|-------------|
| **Dépendances** | Aucune vulnérabilité détectée (npm audit) |
| **HTTPS** | Toutes les API externes utilisent HTTPS (CoinGecko, Alternative.me) |
| **Cache API** | TTL paramétrable (60s) - limite les appels abusifs |
| **Filtrage** | Stablecoins filtrés des données affichées |
| **CORS** | Vite config minimaliste, pas de configurations risquées |

### ⚠️ Points d'Attention

| Niveau | Problème | Emplacement | Recommandation |
|--------|----------|-------------|----------------|
| **Faible** | **API Key absente** | `constants.js:16,19` | CoinGecko free tier = public mais pas de clé dédiée. Limites strictes (10-30 req/min). OK pour dev, migrer vers clé API si trafic aumenta. |
| **Medium** | **Cache mémoire** | `api.js:3` | `apiCache` est un Map en mémoire. Problèmes: - Perdu au refresh - Pas de persistance cross-tab - Usage mémoire croissant. OK pour petits datasets, envisage Redis pour scale. |
| **Faible** | **Rate Limiter** | _Absent_ | Pas de protection rate limiting côté client. Si l'API fail, le retry automatique peut déclencher des cascading failures. Ajouter un exponential backoff. |
| **Info** | **Theme localStorage** | `App.jsx:19` | Theme sauvegardé en localStorage (pas vulnérable mais info tracking possible). OK, c'est une preference utilisateur classique. |
| **Info** | **Clavier global** | `App.jsx:109` | Event listeners globaux sur touches R/F/T. Faible risque de keylogging si malware sur machine. Risque acceptable. |

### 🔒 Résumé

```
Sécurité globale: BONNE ✓
- Pas de vulnérabilités critiques
- Pas de données sensibles exposées
- APIs tierces fiables (CoinGecko, Alternative.me)
- Code propre et simple
```

**Recommandations prioritaires:**
1. Ajouter un **retry avec backoff exponentiel** dans `api.js`
2. Migrer vers **Clé API CoinGecko** si le site est publié en production
3. Ajouter un **rate limit côté client** (max 1 req toutes les 5s)

---
*Rapport généré le 18 avril 2026*
