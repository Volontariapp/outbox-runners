# Outbox Runners

## Project Overview & Value Proposition

Le dépôt **`outbox-runners`** centralise l'ensemble des workers (démons en arrière-plan) responsables de l'exécution du **Pattern Outbox Transactionnel** pour l'écosystème Volontariapp. 

La proposition de valeur de ce projet est de résoudre le **Problème de la Double Écriture (Dual Write Problem)** tout en garantissant la consistance à terme (Eventual Consistency) des données distribuées. En s'appuyant sur des processus légers (Lean Mode) découplés des microservices principaux, ce projet assure la publication fiable des événements asynchrones vers le Message Broker (Redis/BullMQ/Kafka) sans pénaliser les performances des API synchrones HTTP/gRPC.

## Key Features

- **Consommation Résiliente (Polling)** : Scrutation continue des tables de base de données (`jobs_outbox`, `event_outbox`) pour identifier les messages en attente.
- **Architecture Lean Mode** : Exécution en pur Node.js (sans le surcoût de NestJS) pour maximiser le débit (throughput) et minimiser l'empreinte mémoire.
- **Isolation par Domaine** : Un runner dédié par domaine (ex: `outbox-user`, `outbox-social`) pour éviter les single points of failure (SPOF) et permettre un scaling granulaire.
- **Gestion Unifiée (`command.sh`)** : Un Command Center centralisé permettant d'installer, builder, linter, lancer et scripter facilement (scaffolding) de nouveaux runners.
- **Health Checks & Observabilité** : Vérification de la connectivité réseau et de l'état de la base de données au démarrage via `@volontariapp/health-check`.

## Tech Stack & Dependencies

| Composant | Technologie | Usage / Rôle |
| :--- | :--- | :--- |
| **Environnement d'Exécution** | Node.js (Pur) | Exécution asynchrone hautement optimisée, sans framework lourd. |
| **Moteur Outbox** | [`@volontariapp/outbox`](https://github.com/Volontariapp/npm-packages/tree/main/packages/outbox) | Librairie centrale contenant la logique de polling, de dispatch et de retry. |
| **Accès aux Données** | `@volontariapp/bridge` | Interface d'accès DB optimisée pour les workers. |
| **Flux & Streams (Optionnel)** | RxJS | Manipulation de flux asynchrones complexes si nécessaire. |
| **Scaffolding / Outillage** | Shell Script | `command.sh` pour l'orchestration des tâches (Build/Run/Create). |

## Getting Started

### Prérequis

- **Node.js** (>= 24.14.0)
- **Package Manager** : Yarn v4 (`corepack enable`)
- Une base de données PostgreSQL et un serveur Redis accessibles (gérés localement via `ci-tools`).

### Installation et Command Center

Plutôt que de gérer chaque sous-projet individuellement, le script `command.sh` orchestre tout :

```bash
cd outbox-runners

# Installation des dépendances pour tous les runners
./command.sh
# Sélectionnez l'option : 1 (Install All)

# Build de tous les projets
./command.sh
# Sélectionnez l'option : 2 (Build All)
```

### Exécution Locale

Pour lancer tous les runners simultanément en local :

```bash
./command.sh
# Sélectionnez l'option : 4 (Run All)
```

## Testing & Scaffolding

- **Linting** : Unifié via l'option **3 (Lint All)** du Command Center.
- **Scaffolding** : Pour ajouter un nouveau microservice/domaine dans l'écosystème, vous pouvez générer un runner pré-configuré via l'option **8 (Create Outbox)**, qui instanciera le code boilerplate automatiquement.

## CI/CD & Deployment

- Chaque push sur la branche principale déclenche la validation (Lint/Build).
- En cas de succès, le CI/CD met à jour le sous-module Git correspondant dans le dépôt `deploy`, déclenchant ainsi un redéploiement GitOps automatique sur le cluster Kubernetes (généralement via des objets `Deployment` ou `CronJob`).
