# Pocket

Socle technique de Pocket :

- backend Node.js, Express et TypeScript ;
- accès à PostgreSQL avec le pilote `pg`, sans ORM ;
- frontend React, Vite et TypeScript ;
- PostgreSQL local avec Docker Compose.

Aucun modèle métier et aucun CRUD ne sont encore implémentés.

## Structure

```text
Pocket/
├── backend/       configuration de l’API Express et de PostgreSQL
├── frontend/      application React/Vite minimale
├── compose.yaml   service PostgreSQL
└── .env.example   variables d’environnement attendues
```

## Prérequis

- Node.js 20.19 ou plus récent ;
- npm ;
- Docker avec `docker compose`.

## Démarrage

Depuis la racine du projet :

```bash
cp .env.example .env
npm install
docker compose up -d db
```

Lancer l’API :

```bash
npm run dev:api
```

Dans un deuxième terminal, lancer React :

```bash
npm run dev:web
```

- frontend : <http://localhost:5173>
- backend : <http://localhost:3000>
- test de connexion à PostgreSQL : <http://localhost:3000/health>

## Variables PostgreSQL

```dotenv
POSTGRES_DB=pocket
POSTGRES_USER=pocket
POSTGRES_PASSWORD=pocket_dev_password
POSTGRES_PORT=5432
DATABASE_URL=postgresql://pocket:pocket_dev_password@localhost:5432/pocket
```

Les quatre variables `POSTGRES_*` configurent le conteneur. `DATABASE_URL` est
l’URL utilisée par le backend dans `backend/src/database.ts`.

## Compilation

```bash
npm run build
```
