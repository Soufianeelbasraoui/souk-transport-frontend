#  SoukTransport - Frontend

Application web moderne de gestion et de mise en relation pour le transport de marchandises et de fret, reliant les **Expéditeurs**, les **Transporteurs** et les **Administrateurs**.

---

##  Aperçu du Projet

**SoukTransport** est une plateforme SaaS facilitant la logistique et l'optimisation des flux de transport :
- Permet aux **transporteurs** de rentabiliser leurs trajets en publiant leurs capacités de transport et camions disponibles.
- Permet aux **expéditeurs** de rechercher des trajets disponibles, d'enregistrer leurs cargaisons et de réserver du volume de transport au meilleur coût.
- Offre aux **administrateurs** un tableau de bord centralisé pour superviser les utilisateurs, les flottes, les trajets, les réservations et les transactions financières.

---

##  Fonctionnalités Clés

###  Espace Administrateur
- **Dashboard analytique** : Vue d'ensemble des statistiques de la plateforme.
- **Gestion des Utilisateurs** : Visualisation, ajout, modification et suppression des comptes (Expéditeurs, Transporteurs, Admins).
- **Gestion de la Flotte** : Supervision globale de tous les camions enregistrés.
- **Gestion des Trajets & Cargaisons** : Contrôle et modération des trajets et des cargaisons créées.
- **Gestion des Réservations & Paiements** : Suivi des réservations et historique des transactions.

###  Espace Transporteur
- **Gestion de la flotte personnelle (Mes Camions)** : Ajout, modification et consultation des camions.
- **Publication des Trajets (Mes Trajets)** : Création et planification des itinéraires avec points de départ/arrivée, dates et capacités disponibles.
- **Gestion des Réservations Reçues** : Acceptation/refus et suivi des demandes de transport des expéditeurs.
- **Gestion du profil** : Informations personnelles et professionnelles.

###  Espace Expéditeur
- **Recherche de Trajets** : Consultation des trajets disponibles correspondant aux besoins d'expédition.
- **Gestion des Cargaisons (Mes Cargaisons)** : Déclaration des marchandises (poids, dimensions, type).
- **Réservations & Suivi** : Création de réservations sur un trajet et suivi de leur statut.
- **Module de Paiement** : Règlement sécurisé des réservations de fret.
- **Gestion du profil** : Paramètres du compte expéditeur.

###  Authentification & Sécurité
- Inscription et Connexion avec attribution de rôles (`ADMIN`, `TRANSPORTEUR`, `EXPEDITEUR`).
- Gestion de session par **JWT (JSON Web Token)** avec intercepteur Axios automatique (`Bearer Token`).
- **Route Guards** : Protection des routes selon le statut d'authentification et le rôle de l'utilisateur (`ProtectedRoute`, `RoleRoute`, `PublicRoute`).

---

##  Stack Technique

- **Framework** : [React 19](https://react.dev/)
- **Outil de Build & Serveur de Dev** : [Vite 8](https://vitejs.dev/)
- **Routage** : [React Router v7](https://reactrouter.com/)
- **Formulaires & Validation** : [React Hook Form](https://react-hook-form.com/) & [Yup](https://github.com/jquense/yup)
- **UI & Composants** : 
  - [Bootstrap 5](https://getbootstrap.com/) & [React-Bootstrap](https://react-bootstrap.github.io/)
  - [Material UI (MUI)](https://mui.com/) & Emotion
  - [React Icons](https://react-icons.github.io/react-icons/)
- **Communication API** : [Axios](https://axios-http.com/)
- **Notifications Toast** : [React-Toastify](https://fkhadra.github.io/react-toastify/)

---

##  Architecture du Projet

```text
souktransport-frontend/
├── public/                 # Fichiers statiques
├── src/
│   ├── assets/             # Images, logos et médias
│   ├── components/         # Composants réutilisables
│   │   ├── camion/         # CRUD & formulaires Camions
│   │   ├── cargaison/      # CRUD & formulaires Cargaisons
│   │   ├── common/         # Composants UI transversaux (Modals, Buttons, etc.)
│   │   ├── home/           # Composants de la Landing Page
│   │   ├── layout/         # Navbar, Sidebar, Footer
│   │   ├── reservations/   # Composants de gestion des réservations
│   │   └── trajet/         # CRUD & formulaires Trajets
│   ├── pages/              # Pages organisées par domaine / rôle
│   │   ├── admin/          # Pages réservées à l'administrateur
│   │   ├── auth/           # Login, Register
│   │   ├── expediteur/     # Pages de l'espace Expéditeur
│   │   ├── transporteur/   # Pages de l'espace Transporteur
│   │   ├── HomePage.jsx    # Page d'accueil publique
│   │   ├── NotFoundPage.jsx
│   │   └── unauthorized.jsx
│   ├── routes/             # Configuration des routes et gardes d'accès
│   │   ├── AppRoutes.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── PublicRoute.jsx
│   │   └── RoleRoute.jsx
│   ├── services/           # Configuration Axios et appels API
│   │   ├── api.js
│   │   └── authService.js
│   ├── styles/             # Feuilles de styles globales et modules CSS
│   ├── App.jsx             # Composant racine
│   ├── main.jsx            # Point d'entrée React
│   └── index.css           # Styles globaux
├── package.json            # Dépendances et scripts
├── vite.config.js          # Configuration Vite
└── README.md               # Documentation du projet
```

---

##  Installation et Démarrage

### Prérequis
- [Node.js](https://nodejs.org/) (version 18+ recommandée)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/) / [pnpm](https://pnpm.io/)
- Le backend SoukTransport actif (par défaut accessible sur `http://localhost:8080`)

### Installation

1. Cloner le dépôt :
   ```bash
   git clone <URL_DU_REPO>
   cd souktransport-frontend
   ```

2. Installer les dépendances :
   ```bash
   npm install
   ```

### Lancer en mode développement

Démarrez le serveur de développement local avec rechargement à chaud (HMR) :
```bash
npm run dev
```
L'application sera accessible sur [http://localhost:5173](http://localhost:5173) (ou le port indiqué par Vite).

### Build pour la production

Pour compiler et optimiser l'application pour le déploiement :
```bash
npm run build
```

Pour prévisualiser localement le build de production :
```bash
npm run preview
```

---

##  Scripts Disponibles

| Commande | Action |
| :--- | :--- |
| `npm run dev` | Démarre le serveur de développement Vite |
| `npm run build` | Compile l'application pour la production dans le dossier `dist/` |
| `npm run preview` | Prévisualise la version compilée en local |
| `npm run lint` | Exécute l'analyse statique du code avec Oxlint |

---

##  Configuration API & Backend

Par défaut, l'application est configurée pour communiquer avec le backend à l'adresse suivante dans [src/services/api.js](file:///c:/Users/soufiane/Desktop/souktransport-frontend/src/services/api.js) :
```javascript
baseURL: "http://localhost:8080"
```
Pour la mise en production ou le changement d'URL, vous pouvez adapter cette valeur ou utiliser des variables d'environnement (`VITE_API_URL`).
