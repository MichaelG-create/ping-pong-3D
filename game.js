// =========================================
// PING PONG 3D - LOGIQUE PRINCIPALE
// =========================================

// =========================================
// VARIABLES GLOBALES
// =========================================

// === OBJETS THREE.JS ===
let scene, camera, renderer;
let table, ball, playerPaddle, aiPaddle;

// === CONTRÔLES ET INTERACTIONS ===
let mouse = { x: 0, y: 0 };

// === ÉTAT DU JEU ===
let playerScore = 0;
let aiScore = 0;
let gameState = 'playing'; // 'playing', 'paused', 'gameOver'

// === CONSTANTES DU JEU ===
const GAME_CONFIG = {
    table: {
        width: 18,  // Largeur réduite (axe X)
        height: 24, // Longueur augmentée (axe Z)
        thickness: 0.2
    },
    ball: {
        radius: 0.2,
        segments: 16
    },
    paddle: {
        width: 1.5,
        epaisseur: 0.2,
        hauteur: 4
    },
    camera: {
        fov: 75, // Angle de vue plus large
        position: { x: 0, y: 5, z: 18 }
    }
};

// === VARIABLES POUR LA PHYSIQUE DE LA BALLE ===
let ballVelocity = { x: 0, y: 0, z: 0 };
let ballInPlay = false;
let ballOnTable = true;
let gravity = -0.02;
let bounceRestitution = 0.8;


// =========================================
// INITIALISATION PRINCIPALE
// =========================================

function init() {
    console.log("🎮 Initialisation du jeu Ping Pong 3D...");
    
    // Vérification que Three.js est chargé
    if (typeof THREE === 'undefined') {
        console.error("❌ Three.js n'est pas chargé !");
        return;
    }
    
    // Création des composants de base
    createScene();
    createCamera();
    createRenderer();
    
    // Création des éléments du jeu
    createTable();
    createBall();
    createPaddles();
    createLights();
    
    // Configuration des interactions
    setupControls();
    
    // Initialisation de l'interface
    updateScore();
    
    console.log("✅ Jeu initialisé avec succès !");
}

// =========================================
// CRÉATION DE LA SCÈNE 3D
// =========================================

function createScene() {
    console.log("📦 Création de la scène 3D...");
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Bleu ciel
    scene.fog = new THREE.Fog(0x87CEEB, 10, 50); // Brouillard pour la profondeur
}

function createCamera() {
    console.log("📷 Configuration de la caméra...");
    camera = new THREE.PerspectiveCamera(
        GAME_CONFIG.camera.fov,                    // Angle de vue
        window.innerWidth / window.innerHeight,    // Ratio d'aspect
        0.1,                                       // Distance minimale
        1000                                       // Distance maximale
    );
    
    const pos = GAME_CONFIG.camera.position;
    camera.position.set(pos.x, pos.y, pos.z);
    camera.lookAt(0, 0, 0); // Regarde le centre de la table
}

function createRenderer() {
    console.log("🎨 Configuration du moteur de rendu...");
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Activation des ombres
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Paramètres de rendu
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.physicallyCorrectLights = true;
    
    // Ajout du canvas au DOM
    const container = document.getElementById('gameContainer');
    if (container) {
        container.appendChild(renderer.domElement);
    } else {
        console.error("❌ Conteneur 'gameContainer' non trouvé !");
    }
}

// =========================================
// CRÉATION DES ÉLÉMENTS DE JEU
// =========================================

function createTable() {
    console.log("🏓 Création de la table de ping pong...");
    
    // Groupe pour contenir tous les éléments de la table
    table = new THREE.Group();
    
    // === SURFACE DE LA TABLE ===
    const tableGeometry = new THREE.BoxGeometry(
        GAME_CONFIG.table.width,    // Largeur (axe X)
        GAME_CONFIG.table.thickness, // Épaisseur (axe Y)
        GAME_CONFIG.table.height    // Longueur (axe Z)
    );
    const tableMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x228B22,
        roughness: 0.8,
        metalness: 0.1
    });
    const tableSurface = new THREE.Mesh(tableGeometry, tableMaterial);
    tableSurface.position.y = 0;
    tableSurface.receiveShadow = true;
    table.add(tableSurface);
    
    // === LIGNE CENTRALE ===
    const lineGeometry = new THREE.BoxGeometry(GAME_CONFIG.table.width, 0.21, 0.1);
    const lineMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    const centerLine = new THREE.Mesh(lineGeometry, lineMaterial);
    centerLine.position.set(0, 0.11, 0);
    table.add(centerLine);
    
    // === FILET ===
    const netGeometry = new THREE.BoxGeometry(GAME_CONFIG.table.width, 1, 0.1);
    const netMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x333333,
        transparent: true,
        opacity: 0.8
    });
    const net = new THREE.Mesh(netGeometry, netMaterial);
    net.position.set(0, 0.5, 0);
    net.castShadow = true;
    table.add(net);
    
    // === BORDURES DE LA TABLE ===
    createTableBorders();
    
    // Ajout à la scène
    scene.add(table);
    console.log("✅ Table créée !");
}

function createTableBorders() {
    const borderMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Marron
    const borderHeight = 0.3;
    const borderThickness = 0.2;
    
    // Bordures longues (côtés gauche et droit)
    for (let i = 0; i < 2; i++) {
        const borderGeometry = new THREE.BoxGeometry(borderThickness, borderHeight, GAME_CONFIG.table.height + 0.4);
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.set((i === 0 ? -1 : 1) * (GAME_CONFIG.table.width / 2 + borderThickness / 2), borderHeight / 2, 0);
        border.castShadow = true;
        border.receiveShadow = true;
        table.add(border);
    }
    
    // Bordures courtes (extrémités avant et arrière)
    for (let i = 0; i < 2; i++) {
        const borderGeometry = new THREE.BoxGeometry(GAME_CONFIG.table.width + 0.4, borderHeight, borderThickness);
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.set(0, borderHeight / 2, (i === 0 ? -1 : 1) * (GAME_CONFIG.table.height / 2 + borderThickness / 2));
        border.castShadow = true;
        border.receiveShadow = true;
        table.add(border);
    }
}

function createBall() {
    console.log("⚪ Création de la balle...");
    
    const ballGeometry = new THREE.SphereGeometry(
        GAME_CONFIG.ball.radius, 
        GAME_CONFIG.ball.segments, 
        GAME_CONFIG.ball.segments
    );
    const ballMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xFFFFFF,
        roughness: 0.3,
        metalness: 0.1
    });
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    
    // Position initiale
    ball.position.set(0, 2, 9.5);
    ball.castShadow = true;
    
    scene.add(ball);
    console.log("✅ Balle créée !");
}

function createPaddles() {
    console.log("🏓 Création des raquettes...");
    
    // Géométrie commune pour les deux raquettes
    const paddleGeometry = new THREE.BoxGeometry(
        GAME_CONFIG.paddle.width, 
        GAME_CONFIG.paddle.hauteur, 
        GAME_CONFIG.paddle.epaisseur
    );
    
    // === RAQUETTE DU JOUEUR ===
    const playerMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xFF0000,
        roughness: 0.6,
        metalness: 0.2
    });
    playerPaddle = new THREE.Mesh(paddleGeometry, playerMaterial);
    playerPaddle.position.set(0, 1, 10);
    playerPaddle.castShadow = true;
    scene.add(playerPaddle);
    
    // === RAQUETTE DE L'IA ===
    const aiMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x0000FF,
        roughness: 0.6,
        metalness: 0.2
    });
    aiPaddle = new THREE.Mesh(paddleGeometry, aiMaterial);
    aiPaddle.position.set(0, 1, -10);
    aiPaddle.castShadow = true;
    scene.add(aiPaddle);
    
    console.log("✅ Raquettes créées !");
}

function createLights() {
    console.log("💡 Configuration de l'éclairage...");
    
    // === LUMIÈRE AMBIANTE ===
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    // === LUMIÈRE DIRECTIONNELLE PRINCIPALE ===
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    
    // Configuration des ombres
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    
    scene.add(directionalLight);
    
    // === LUMIÈRE D'APPOINT ===
    const spotLight = new THREE.SpotLight(0xffffff, 0.3);
    spotLight.position.set(0, 15, 0);
    spotLight.target = table;
    scene.add(spotLight);
    
    console.log("✅ Éclairage configuré !");
}

// =========================================
// SYSTÈME DE CONTRÔLES
// =========================================

function setupControls() {
    console.log("🎮 Configuration des contrôles...");
    
    // === CONTRÔLE À LA SOURIS ===
    document.addEventListener('mousemove', handleMouseMove);
    
    // === CONTRÔLE AU CLAVIER ===
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // === GESTION DU FOCUS ===
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    
    console.log("✅ Contrôles configurés !");
}

function handleMouseMove(event) {
    // Conversion des coordonnées écran en coordonnées normalisées (-1 à 1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Déplacement de la raquette du joueur avec limites
    const maxX = GAME_CONFIG.table.width / 2 - GAME_CONFIG.paddle.width / 2;
    
    // Ajustement pour que la raquette atteigne les bords quand la souris est à 75% de la largeur
    // Diviser par 0.75 pour compenser le fait que la table n'occupe que 75% de l'écran
    const adjustedMouseX = mouse.x / 0.75;
    
    // Limiter pour éviter que la raquette sorte des limites si la souris va trop loin
    const clampedMouseX = Math.max(-1, Math.min(1, adjustedMouseX));
    
    playerPaddle.position.x = clampedMouseX * maxX;
}
// === FONCTION HANDLEKEYDOWN MODIFIÉE ===
function handleKeyDown(event) {
    if (gameState !== 'playing') return;
    
    switch(event.key) {
        case 'ArrowUp':
            event.preventDefault();
            if (!ballInPlay) {
                console.log("🎯 Touche ↑ pressée - Service de la balle !");
                serveBall();
            } else {
                console.log("🎯 Touche ↑ pressée - Balle déjà en jeu !");
            }
            break;
        case ' ':
            event.preventDefault();
            console.log("⏸️ Pause du jeu");
            gameState = gameState === 'playing' ? 'paused' : 'playing';
            break;
        case 'r':
        case 'R':
            console.log("🔄 Redémarrage du jeu");
            playerScore = 0;
            aiScore = 0;
            updateScore();
            resetBall();
            gameState = 'playing';
            break;
    }
}

function handleKeyUp(event) {
    // Gérer les touches relâchées si nécessaire
}

function handleWindowBlur() {
    console.log("🔍 Fenêtre perdue - Pause automatique");
    // TODO: Pause automatique quand la fenêtre perd le focus
}

function handleWindowFocus() {
    console.log("🔍 Fenêtre retrouvée");
    // TODO: Reprendre le jeu si nécessaire
}

// =========================================
// GESTION DU JEU
// =========================================

function updateScore() {
    console.log(`📊 Score mis à jour: Joueur ${playerScore} - ${aiScore} IA`);
    
    const playerScoreElement = document.getElementById('playerScore');
    const aiScoreElement = document.getElementById('aiScore');
    
    if (playerScoreElement && aiScoreElement) {
        playerScoreElement.textContent = playerScore;
        aiScoreElement.textContent = aiScore;
    }
}

function checkGameEnd() {
    const winningScore = 11;
    if (playerScore >= winningScore || aiScore >= winningScore) {
        gameState = 'gameOver';
        console.log(`🏆 Fin de partie ! ${playerScore >= winningScore ? 'Joueur' : 'IA'} gagne !`);
        // TODO: Afficher l'écran de fin de partie
    }
}

// =========================================
// INTELLIGENCE ARTIFICIELLE
// =========================================

function updateAI() {
    if (gameState !== 'playing') return;
    
    // Mouvement simple de l'IA (suit la balle avec un délai)
    // const targetX = ball.position.x * 0.7; // Facteur de difficulté
    const targetX = ball.position.x * 1; // Facteur de difficulté
    const currentX = aiPaddle.position.x;
    // const speed = 0.05;
    // const speed = 0.7;
    const speed = 1;
    
    // Déplacement progressif vers la cible
    if (Math.abs(targetX - currentX) > 0.1) {
        aiPaddle.position.x += (targetX - currentX) * speed;
    }
    
    // Limites de déplacement
    const maxX = GAME_CONFIG.table.width / 2 - GAME_CONFIG.paddle.width / 2;
    aiPaddle.position.x = Math.max(-maxX, Math.min(maxX, aiPaddle.position.x));
}

// =========================================
// PHYSIQUE DE LA BALLE
// =========================================

// === FONCTION DE SERVICE ===
function serveBall() {
    console.log("🏓 Service de la balle !");
    
    // Réinitialiser la position de la balle
    ball.position.set(
        playerPaddle.position.x, // Même position X que la raquette
        2, // Hauteur initiale
        playerPaddle.position.z - 1 // Légèrement devant la raquette
    );
    
    // Définir la vélocité initiale
    ballVelocity.x = (Math.random() - 0.5) * 0.1; // Légère variation horizontale
    ballVelocity.y = 0.3; // Vitesse verticale initiale
    ballVelocity.z = -0.3; // Vitesse vers l'adversaire
    
    // Marquer la balle comme étant en jeu
    ballInPlay = true;
    ballOnTable = true;
    
    console.log("✅ Balle servie !");
}
// === MISE À JOUR DE LA PHYSIQUE DE LA BALLE ===
function updateBallPhysics() {
    if (!ballInPlay) return;
    
    // Appliquer la gravité
    ballVelocity.y += gravity;
    
    // Mettre à jour la position
    ball.position.x += ballVelocity.x;
    ball.position.y += ballVelocity.y;
    ball.position.z += ballVelocity.z;
    
    // Vérifier les collisions avec la table
    checkTableCollision();
    
    // Vérifier les collisions avec les raquettes
    checkPaddleCollisions();
    
    // Vérifier les limites du terrain
    checkBoundaries();
}
// === COLLISION AVEC LA TABLE ===
function checkTableCollision() {
    const tableTop = GAME_CONFIG.table.thickness / 2;
    const tableWidth = GAME_CONFIG.table.width / 2;
    const tableLength = GAME_CONFIG.table.height / 2;
    
    // Collision avec le dessus de la table
    if (ball.position.y <= tableTop + GAME_CONFIG.ball.radius && 
        ballVelocity.y < 0 &&
        Math.abs(ball.position.x) <= tableWidth &&
        Math.abs(ball.position.z) <= tableLength) {
        
        ball.position.y = tableTop + GAME_CONFIG.ball.radius;
        ballVelocity.y = -ballVelocity.y * bounceRestitution;
        
        console.log("🏓 Rebond sur la table !");
    }
}

// === COLLISION AVEC LES RAQUETTES ===
function checkPaddleCollisions() {
    const ballRadius = GAME_CONFIG.ball.radius;
    const paddleWidth = GAME_CONFIG.paddle.width / 2;
    const paddleHeight = GAME_CONFIG.paddle.hauteur / 2;
    const paddleDepth = GAME_CONFIG.paddle.epaisseur / 2;
    
    // Collision avec la raquette du joueur
    if (ball.position.z >= playerPaddle.position.z - paddleDepth - ballRadius &&
        ball.position.z <= playerPaddle.position.z + paddleDepth + ballRadius &&
        Math.abs(ball.position.x - playerPaddle.position.x) <= paddleWidth + ballRadius &&
        Math.abs(ball.position.y - playerPaddle.position.y) <= paddleHeight + ballRadius &&
        ballVelocity.z > 0) {
        
        // Rebond sur la raquette du joueur
        ballVelocity.z = -Math.abs(ballVelocity.z) * 1.1; // Accélération
        ballVelocity.x += (ball.position.x - playerPaddle.position.x) * 0.1; // Effet de direction
        ballVelocity.y = Math.abs(ballVelocity.y) * 1.1 + 0.1; // Rebond vers le haut
        
        console.log("🏓 Rebond sur la raquette du joueur !");
    }
    
    // Collision avec la raquette de l'IA
    if (ball.position.z <= aiPaddle.position.z + paddleDepth + ballRadius &&
        ball.position.z >= aiPaddle.position.z - paddleDepth - ballRadius &&
        Math.abs(ball.position.x - aiPaddle.position.x) <= paddleWidth + ballRadius &&
        Math.abs(ball.position.y - aiPaddle.position.y) <= paddleHeight + ballRadius &&
        ballVelocity.z < 0) {
        
        // Rebond sur la raquette de l'IA
        ballVelocity.z = Math.abs(ballVelocity.z) * 1.1; // Accélération
        ballVelocity.x += (ball.position.x - aiPaddle.position.x) * 0.1; // Effet de direction
        ballVelocity.y = Math.abs(ballVelocity.y) * 1.1 + 0.1; // Rebond vers le haut
        
        console.log("🏓 Rebond sur la raquette de l'IA !");
    }
}

// === VÉRIFICATION DES LIMITES ===
function checkBoundaries() {
    const tableLength = GAME_CONFIG.table.height / 2;
    
    // Balle sort côté joueur
    if (ball.position.z > tableLength + 2) {
        console.log("🎯 Point pour l'IA !");
        aiScore++;
        updateScore();
        checkGameEnd();
        resetBall();
    }
    
    // Balle sort côté IA
    if (ball.position.z < -tableLength - 2) {
        console.log("🎯 Point pour le joueur !");
        playerScore++;
        updateScore();
        checkGameEnd();
        resetBall();
    }
    
    // Balle tombe trop bas
    if (ball.position.y < -2) {
        console.log("💥 Balle tombée !");
        // Déterminer qui marque selon la position Z
        if (ball.position.z > 0) {
            aiScore++;
            console.log("🎯 Point pour l'IA (balle tombée côté joueur) !");
        } else {
            playerScore++;
            console.log("🎯 Point pour le joueur (balle tombée côté IA) !");
        }
        updateScore();
        checkGameEnd();
        resetBall();
    }
}
// === RÉINITIALISATION DE LA BALLE ===
function resetBall() {
    // Remettre la balle en position de service
    ball.position.set(0, 2, 9.5);
    ballVelocity = { x: 0, y: 0, z: 0 };
    ballInPlay = false;
    ballOnTable = true;
    
    console.log("🔄 Balle réinitialisée - Appuyez sur ↑ pour servir");
}

// =========================================
// BOUCLE PRINCIPALE D'ANIMATION
// =========================================

function animate() {
    // Demande la prochaine frame d'animation
    requestAnimationFrame(animate);
    
    // Mise à jour de l'IA
    updateAI();
    
    // Mise à jour de la physique de la balle
    updateBallPhysics();
    
    // === ANIMATIONS ===
    if (gameState === 'playing') {
        if (ballInPlay) {
            // Rotation de la balle quand elle est en mouvement
            ball.rotation.x += ballVelocity.z * 0.5;
            ball.rotation.z += ballVelocity.x * 0.5;
        } else {
            // Oscillation légère quand la balle attend le service
            ball.position.y = 2 + Math.sin(Date.now() * 0.003) * 0.1;
        }
    }
    
    // === RENDU DE LA SCÈNE ===
    renderer.render(scene, camera);
}

// =========================================
// GESTION DES ÉVÉNEMENTS
// =========================================

function onWindowResize() {
    console.log("📱 Redimensionnement de la fenêtre...");
    
    // Mise à jour du ratio d'aspect de la caméra
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Mise à jour de la taille du renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Écoute du redimensionnement
window.addEventListener('resize', onWindowResize);

// =========================================
// UTILITAIRES
// =========================================

function logGameState() {
    console.log("=== ÉTAT DU JEU ===");
    console.log(`Score: ${playerScore} - ${aiScore}`);
    console.log(`État: ${gameState}`);
    console.log(`Position balle: (${ball.position.x.toFixed(2)}, ${ball.position.y.toFixed(2)}, ${ball.position.z.toFixed(2)})`);
    console.log(`Position raquette joueur: (${playerPaddle.position.x.toFixed(2)}, ${playerPaddle.position.y.toFixed(2)}, ${playerPaddle.position.z.toFixed(2)})`);
    console.log(`Position raquette IA: (${aiPaddle.position.x.toFixed(2)}, ${aiPaddle.position.y.toFixed(2)}, ${aiPaddle.position.z.toFixed(2)})`);
    console.log("==================");
}

// =========================================
// DÉMARRAGE DU JEU
// =========================================

// Démarrage automatique quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    console.log("📄 DOM chargé, démarrage du jeu...");
    init();
    animate();
    
    // Log périodique pour le debug (optionnel)
    setInterval(logGameState, 5000);
    
    console.log("🚀 Jeu démarré ! Amusez-vous bien !");
});

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
    console.error("❌ Erreur dans le jeu:", event.error);
});