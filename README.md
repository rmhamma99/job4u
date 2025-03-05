# Job Board Application

Une plateforme moderne de recherche d'emploi avec génération de CV et lettres de motivation par IA.

## Prérequis

- Node.js (v20)
- PostgreSQL
- Git
- VS Code (recommandé)

## Installation

1. Clonez le projet:
```bash
git clone <your-repository-url>
cd <project-directory>
```

2. Installez les dépendances:
```bash
npm install
```

3. Créez un fichier `.env` à la racine du projet avec les variables suivantes:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/jobboard"
OPENAI_API_KEY="votre-clé-api-openai"
SESSION_SECRET="une-chaine-aleatoire-longue"
```

4. Initialisez la base de données:
```bash
npm run db:push
```

## Démarrage

1. Démarrez le serveur de développement:
```bash
npm run dev
```

2. Ouvrez http://localhost:5000 dans votre navigateur

## Structure du Projet

```
├── client/          # Frontend React
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── pages/
├── server/          # Backend Express
│   ├── services/
│   └── routes.ts
└── shared/          # Code partagé
    └── schema.ts    # Schéma de la base de données
```

## Fonctionnalités

- 👤 Authentification utilisateur
- 💼 Gestion des offres d'emploi
- 📝 Générateur de CV et lettres de motivation avec IA
- 🎥 Système d'entretiens vidéo
- 🔍 Recherche d'emplois avancée

## Outils de Développement Recommandés pour VS Code

Extensions VS Code recommandées:
- ESLint
- Prettier
- TypeScript
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

## Scripts Disponibles

- `npm run dev`: Démarre le serveur de développement
- `npm run build`: Compile le projet
- `npm run db:push`: Met à jour le schéma de la base de données
- `npm run start`: Démarre le serveur en production

## Notes

- Assurez-vous que PostgreSQL est en cours d'exécution avant de démarrer l'application
- Pour le développement local, vous pouvez utiliser pgAdmin ou un autre outil de gestion de base de données PostgreSQL
- Le serveur de développement utilise le port 5000 par défaut
