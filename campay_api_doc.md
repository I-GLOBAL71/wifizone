# CamPay API Documentation (Résumé complet en Markdown)

## Base URL
```
https://campay.net/api/
```

---

## Authentication
- **API Key** et **API Secret** fournis par CamPay.
- Utilisation du endpoint `/token/` pour obtenir un `Bearer Token`.

### Exemple
**POST** `/token/`
```json
{
  "username": "<API_KEY>",
  "password": "<API_SECRET>"
}
```

**Réponse**
```json
{
  "token": "<ACCESS_TOKEN>"
}
```

---

## Endpoints principaux

### 1. Vérifier le solde
**GET** `/balance/`

Headers :
```
Authorization: Token <ACCESS_TOKEN>
```

**Réponse**
```json
{
  "available_balance": "50000",
  "currency": "XAF"
}
```

---

### 2. Paiement Mobile Money entrant
**POST** `/collect/`

**Request Body**
```json
{
  "amount": "1000",
  "currency": "XAF",
  "from": "+2376XXXXXXX",
  "description": "Achat data forfait"
}
```

**Réponse**
```json
{
  "reference": "abc123",
  "status": "PENDING"
}
```

---

### 3. Paiement sortant (disbursement)
**POST** `/disburse/`

**Request Body**
```json
{
  "amount": "2000",
  "currency": "XAF",
  "to": "+2376YYYYYYY",
  "description": "Paiement prestataire"
}
```

**Réponse**
```json
{
  "reference": "xyz456",
  "status": "PENDING"
}
```

---

### 4. Vérifier statut d’une transaction
**POST** `/transaction/`

**Request Body**
```json
{
  "reference": "abc123"
}
```

**Réponse**
```json
{
  "reference": "abc123",
  "status": "SUCCESS",
  "amount": "1000",
  "currency": "XAF"
}
```

---

## Webhooks
CamPay envoie des notifications automatiques à votre **callback_url** définie lors des transactions.

**Exemple de payload reçu**
```json
{
  "reference": "abc123",
  "status": "SUCCESS",
  "amount": "1000",
  "currency": "XAF",
  "customer": "+2376XXXXXXX"
}
```

⚠️ **Vérifier toujours la signature et le statut avant de créditer l’utilisateur.**

---

## Codes de statut
- `PENDING` : transaction en attente
- `SUCCESS` : transaction réussie
- `FAILED` : transaction échouée
- `CANCELLED` : annulée

---

## Bonnes pratiques
1. Toujours **rafraîchir le token** périodiquement.
2. Utiliser HTTPS pour votre callback.
3. Journaliser toutes les requêtes / réponses.
4. Implémenter des mécanismes de **retry** côté serveur.

---

## Exemple d’intégration (cURL)

### Collect
```bash
curl -X POST https://campay.net/api/collect/ \
  -H "Authorization: Token <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
        "amount": "1000",
        "currency": "XAF",
        "from": "+2376XXXXXXX",
        "description": "Achat data"
      }'
```

### Vérifier transaction
```bash
curl -X POST https://campay.net/api/transaction/ \
  -H "Authorization: Token <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
        "reference": "abc123"
      }'
```

---

## Résumé
Avec CamPay, vous pouvez :
- Vérifier votre solde
- Initier des collectes (paiements entrants)
- Effectuer des paiements sortants (disbursements)
- Vérifier le statut d’une transaction
- Recevoir des callbacks automatiques

👉 Il suffit donc de gérer :
- Authentification (token)
- Création de transaction (collect/disburse)
- Vérification transaction
- Callback sécurisés

