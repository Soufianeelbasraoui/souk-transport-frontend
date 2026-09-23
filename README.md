# 1. Nom du projet

**Nom du projet :** SoukTransport - Frontend

---

# 2. Présentation du projet

SoukTransport est une application web qui permet de mettre en relation les expéditeurs et les transporteurs pour faciliter le transport de marchandises.

Elle s'adresse principalement aux **expéditeurs**, aux **transporteurs** et aux **administrateurs** de la plateforme.

Son objectif principal est de faciliter la recherche de trajets, la gestion des cargaisons, des camions et des réservations de transport.

L'application permet également aux administrateurs de superviser les utilisateurs et les différentes opérations de la plateforme.

---

# 3. Problématique

Le problème identifié est que la gestion du transport de marchandises peut être difficile lorsque les expéditeurs doivent trouver des trajets disponibles et que les transporteurs souhaitent optimiser leurs capacités de transport.

La solution proposée permet de centraliser la recherche de trajets, la gestion des cargaisons, la publication des trajets et les réservations dans une seule plateforme web.

---

# 4. Fonctionnalités principales

* Créer et gérer un compte utilisateur selon son rôle.
* Rechercher et consulter les trajets disponibles.
* Gérer les camions et les capacités de transport.
* Créer et gérer les cargaisons.
* Créer et suivre les réservations de transport.
* Superviser les utilisateurs, trajets, cargaisons et réservations depuis l'espace administrateur.

---

# 5. Technologies utilisées

| Technologie           | Utilisation dans le projet                     |
| --------------------- | ---------------------------------------------- |
| **React 19**          | Développement de l'interface utilisateur       |
| **Vite 8**            | Développement et génération du build frontend  |
| **React Router v7**   | Gestion de la navigation et des routes         |
| **Axios**             | Communication avec l'API REST du backend       |
| **React Hook Form**   | Gestion des formulaires                        |
| **Yup**               | Validation des données des formulaires         |
| **Bootstrap 5**       | Mise en forme de l'interface utilisateur       |
| **React-Bootstrap**   | Utilisation de composants Bootstrap avec React |
| **Material UI (MUI)** | Création de composants d'interface             |
| **React Icons**       | Utilisation des icônes dans l'application      |
| **React Toastify**    | Affichage des notifications                    |
| **Git / GitHub**      | Gestion et versionnement du code               |

---

# 6. Installation et lancement

## 6.1 Prérequis

Pour utiliser ce projet, vous devez disposer de :

* Node.js 18 ou une version supérieure
* npm
* Git
* Un navigateur web moderne
* Le backend SoukTransport démarré

---

## 6.2 Cloner le dépôt

```bash
git clone https://github.com/Soufianeelbasraoui/souk-transport-frontend.git
```

---

## 6.3 Ouvrir le dossier

```bash
cd souk-transport-frontend
```

---

## 6.4 Installer les dépendances

```bash
npm install
```

---

## 6.5 Lancer le projet

Lancer le serveur de développement :

```bash
npm run dev
```

Pour générer le build de production :

```bash
npm run build
```

Pour prévisualiser le build :

```bash
npm run preview
```

Pour vérifier le code avec le linter :

```bash
npm run lint
```

---

## 6.6 Ouvrir le projet

Après le lancement :

```text
http://localhost:5173
```

Le backend doit être disponible sur :

```text
http://localhost:8080
```

---

# 7. Contribution personnelle

Ma contribution principale a porté sur le développement de l'application frontend avec **React**, notamment la création des interfaces utilisateur et l'organisation des pages selon les différents rôles.

J'ai également travaillé sur l'intégration de l'API REST avec **Axios**, la gestion de l'authentification **JWT** et la protection des routes selon les rôles des utilisateurs.

J'ai été responsable de plusieurs fonctionnalités liées à la gestion des **camions, trajets, cargaisons et réservations**, ainsi que de leur intégration avec le backend Spring Boot.

---

# 8. Améliorations possibles

Dans une prochaine version, je pourrais :

* Ajouter davantage de tests automatisés pour les composants et les fonctionnalités principales.
* Améliorer la gestion des erreurs et des messages retournés par l'API.
* Améliorer davantage l'expérience utilisateur et le responsive design.
* Déployer l'application frontend et le backend sur un environnement de production.

### Conclusion

Ces améliorations permettraient de rendre l'application plus robuste, plus facile à maintenir et mieux adaptée à une utilisation en production.

