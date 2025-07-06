Voici un exemple de fichier `README.md` pour ton jeu de ping pong 3D en JavaScript, prêt à être utilisé sur GitHub ou dans un projet local :

---

# 🏓 Ping Pong 3D – Jeu Navigateur

Bienvenue dans **Ping Pong 3D**, un jeu de tennis de table en 3D développé en JavaScript à jouer directement dans votre navigateur. Ce projet propose une simulation simplifiée mais fidèle aux règles du tennis de table, avec une raquette contrôlée à la souris et une intelligence artificielle en face.

---

## 🎮 Caractéristiques du jeu

* ✅ Interface 3D avec Three.js (table, balle, raquettes).
* 🧠 Adversaire contrôlé par une IA simple.
* 🖱 Contrôle du joueur via la souris (position + clic).
* 🔄 Alternance des services après chaque point.
* 📊 Affichage en temps réel du score.
* 🧠 Rebond réaliste sur la table (rebond unique ou double selon le contexte).
* ⚖ Respect simplifié des règles officielles du ping pong.

---

## 📏 Règles du jeu

Le jeu applique les règles suivantes :

### 🏓 Service

* Le service doit obligatoirement **rebondir une fois de chaque côté** de la table.
* Si la balle ne rebondit qu’un seul coup, ou si elle rebondit deux fois du même côté pendant le service : **faute**.
* Au début du jeu, le joueur humain à la balle pour servir. Ensuite le service est au joueur qui vient de marquer le point. 

### 🖱 Contrôle du service

* Quand c’est **au joueur humain de servir**, la balle est posée sur sa raquette.
* Il faut **appuyer sur la flèche du haut** pour lancer le service.
* L’IA effectue son service automatiquement après un court délai.

### 🔁 Échanges

* Après le service, la balle ne doit **rebondir qu’une seule fois du côté du receveur** avant d’être renvoyée.
* Le joueur **doit appuyer sur la touche flèche du haut** pour frapper la balle avec la bonne puissance.
* En cas de double rebond ou balle hors de la table : **point pour l’adversaire**.

### 🧮 Score

* Chaque faute donne **1 point à l’adversaire**.
* Le score est affiché en haut de l’écran.
* Le jeu s’arrête à 11 points.

---

## ▶ Contrôles

| Action               | Contrôle                               |
| -------------------- | -------------------------------------- |
| Déplacer la raquette | Déplacer la souris                     |
| Frapper la balle     | flèche vers le haut                    |
| Servir               | flèche vers le haut pendant le service |

---

## 🔧 Technologies utilisées

* **JavaScript**
* **Three.js** pour l’affichage 3D
* **HTML/CSS** pour l’interface et le score

---

## 📦 Installation / Utilisation

1. Clonez le projet :

   ```bash
   git clone https://github.com/votre-utilisateur/ping-pong-3d.git
   cd ping-pong-3d
   ```

2. Ouvrez simplement `index.html` dans un navigateur moderne (Chrome ou Firefox recommandé).

---

## 🧪 Idées futures

* Ajout d’un mode 2 joueurs
* Mode entraînement (sans score)
* Sons et animations de victoire
* Niveau de difficulté ajustable pour l’IA
* Comptage des sets (à 11 points)

---

## 🧑‍💻 Auteur

Créé par **Mathéo Garcia Rollet et son père**, dans le cadre d’un projet de jeu interactif en JavaScript.

---


