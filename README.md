# Radiasud API - Airtable

Cette API permet de connecter ton assistant GPT à ta base Airtable via une simple requête HTTP.

## Endpoint

POST /write

Body attendu :
```json
{
  "table": "vehicules",
  "data": {
    "immatriculation": "AB123CD",
    "marque": "Renault"
  }
}
```

## Déploiement rapide sur Render

1. Fork ce dépôt dans ton compte GitHub
2. Va sur https://dashboard.render.com/new/web
3. Choisis ton dépôt forké
4. Build command: `npm install`
5. Start command: `node index.js`
6. Ajoute les env vars :
   - `AIRTABLE_BASE_ID`
   - `AIRTABLE_TOKEN`

7. Déploie 🚀