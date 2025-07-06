let scene, camera, renderer;
let table, ball, playerPaddle, aiPaddle;
let ballVelocity = new THREE.Vector3(0.2, 0, 0.2);
let ballVelocityY = -0.2; // gravité simple
let onGround = false;
let servePhase = true;
let serveBounceCount = { player: 0, ai: 0 };
// Score
let score = 0;

const container = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 10, 20);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Table
  const tableGeometry = new THREE.BoxGeometry(12, 0.5, 20);
  const tableMaterial = new THREE.MeshPhongMaterial({ color: 0x006400 });
  table = new THREE.Mesh(tableGeometry, tableMaterial);
  scene.add(table);

  // Filet (Net) — traverse la largeur (axe X)
  const netGeometry = new THREE.BoxGeometry(12, 0.5, 0.2); // 12 de large (X), mince en Z
  const netMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const net = new THREE.Mesh(netGeometry, netMaterial);
  net.position.set(0, 1.25, 0); // centré, un peu au-dessus de la table
  scene.add(net);

  // Light
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 20, 10);
  scene.add(light);

  // Ball
  const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
  ball = new THREE.Mesh(ballGeometry, ballMaterial);
  ball.position.set(0, 1, 0);
  scene.add(ball);

  // Player paddle
  const paddleGeometry = new THREE.BoxGeometry(3, 0.5, 0.5);
  const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
  playerPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
  playerPaddle.position.set(0, 1, 9.5);
  scene.add(playerPaddle);

  // AI paddle
  aiPaddle = new THREE.Mesh(paddleGeometry, new THREE.MeshPhongMaterial({ color: 0xff0000 }));
  aiPaddle.position.set(0, 1, -9.5);
  scene.add(aiPaddle);

  document.addEventListener('mousemove', onMouseMove, false);
}

function onMouseMove(event) {
  const x = (event.clientX / window.innerWidth) * 2 - 1;
  playerPaddle.position.x = x * 6; // Limit paddle movement
}

function animate() {
  requestAnimationFrame(animate);

  // Ball movement
  ball.position.add(ballVelocity);

    // Gravité simple
    ballVelocityY -= 0.01; // simulate gravity
    ball.position.y += ballVelocityY;

    // Rebond sur la table
    if (ball.position.y <= 1 && !onGround) {
    ballVelocityY = 0.2;
    onGround = true;

    // Enregistre les rebonds pendant le service
    if (servePhase) {
        if (ball.position.z > 0) {
        serveBounceCount.player += 1;
        } else {
        serveBounceCount.ai += 1;
        }
    }
    }

    // Sortie de la balle du plateau
    if (ball.position.y <= 0.2 && ball.position.z > 10 || ball.position.z < -10) {
    alert("Game Over! Score: " + score);
    resetGame();
    }

    // Ball touches the table again => reset "onGround" state
    if (ball.position.y > 1.1) {
    onGround = false;
    }

  // Rebond sur les murs
  if (ball.position.x <= -6 || ball.position.x >= 6) {
    ballVelocity.x = -ballVelocity.x;
  }

  // Rebond sur les raquettes
  if (ball.position.z >= 9 && Math.abs(ball.position.x - playerPaddle.position.x) < 1.5) {
    ballVelocity.z = -ballVelocity.z;
    score++;
    scoreDisplay.textContent = score;
  }

  if (ball.position.z <= -9 && Math.abs(ball.position.x - aiPaddle.position.x) < 1.5) {
    ballVelocity.z = -ballVelocity.z;
  }

  // AI paddle suit la balle
  aiPaddle.position.x += (ball.position.x - aiPaddle.position.x) * 0.05;

  // Game over si balle dépasse
  if (ball.position.z > 10 || ball.position.z < -10) {
    alert('Game Over ! Score : ' + score);
    resetGame();
  }

  if (servePhase && serveBounceCount.player >= 1 && serveBounceCount.ai >= 1) {
    servePhase = false; // fin du service
  }


  renderer.render(scene, camera);
}

function resetGame() {
  score = 0;
  scoreDisplay.textContent = 0;
  ball.position.set(0, 2, 0);
  ballVelocity.set(0.2 * (Math.random() > 0.5 ? 1 : -1), 0, 0.2 * (Math.random() > 0.5 ? 1 : -1));
  ballVelocityY = -0.2;
  onGround = false;
  servePhase = true;
  serveBounceCount = { player: 0, ai: 0 };
}
