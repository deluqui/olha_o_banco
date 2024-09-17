// Seleciona a área do jogo, o quadrado do jogador, a tela inicial e a tela de fim de jogo
const gameArea = document.getElementById('gameArea');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const introScreen = document.getElementById('introScreen');
const startButton = document.getElementById('startButton');
const endScreen = document.getElementById('endScreen');
const restartButton = document.getElementById('restartButton');
const backgroundMusic = document.getElementById('backgroundMusic');

// Define o volume da música de fundo para 50%
backgroundMusic.volume = 0.5;

// Variáveis para os intervalos e estado do jogo
let gameInterval;
let moveInterval;
let keyInterval;
let damagePlayed = false;
let score = 0;
let ballInterval = 600; // Intervalo inicial em milissegundos
let playerPosition; // Declara globalmente
const initialBallInterval = 600; // Intervalo inicial em milissegundos
const ballIntervalDecrease = 50; // Quanto o intervalo deve diminuir a cada 30 segundos
const minBallInterval = 200; // Intervalo mínimo de criação de bolas
const playerSpeed = 15; // Velocidade do jogador, declarada globalmente

// Função para limpar e reiniciar o jogo
function resetGame() {
    // Limpa os intervalos
    if (gameInterval) clearInterval(gameInterval);
    if (moveInterval) clearInterval(moveInterval);
    if (keyInterval) clearInterval(keyInterval);

    // Remove todas as bolas do jogo
    const balls = document.querySelectorAll('.ball');
    balls.forEach(ball => gameArea.removeChild(ball));

    // Reseta a pontuação
    score = 0;
    scoreDisplay.textContent = `Pontos: ${score}`;

    // Reseta a variável de controle de efeito sonoro de dano
    damagePlayed = false;

    // Reseta a frequência de spawn das bolas
    ballInterval = initialBallInterval;

    // Oculta a tela de fim de jogo e exibe a tela inicial
    endScreen.style.display = 'none';
    introScreen.style.display = 'none';
    gameArea.style.display = 'block';

    // Reposiciona o jogador no centro e remove transições
    playerPosition = gameArea.offsetWidth / 2 - player.offsetWidth / 2;
    player.style.left = `${playerPosition}px`;
    player.style.transition = 'none';

    // Remove event listeners antigos
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    document.removeEventListener('touchstart', onTouchStart);
    document.removeEventListener('touchend', onTouchEnd);
}

// Função para tocar um efeito sonoro
function playSound(src) {
    const audio = new Audio(src);
    audio.play();
}

// Função para mostrar a tela de fim de jogo
function showEndScreen() {
    // Pausa todos os intervalos e eventos
    if (gameInterval) clearInterval(gameInterval);
    if (moveInterval) clearInterval(moveInterval);
    if (keyInterval) clearInterval(keyInterval);

    gameArea.style.display = 'none';
    endScreen.style.display = 'flex'; // Exibe a tela de fim de jogo
    backgroundMusic.pause(); // Pausa a música de fundo
}

// Função para reiniciar o jogo
function restartGame() {
    resetGame(); // Limpa e reinicia o jogo
    startGame(); // Inicia um novo jogo
}

// Adiciona o evento de clique para reiniciar o jogo
restartButton.addEventListener('click', restartGame);

// Função para parar o movimento contínuo
function stopMovement() {
    clearInterval(keyInterval);
    keyInterval = null;
    clearInterval(moveInterval);
    moveInterval = null;
}

// Funções para movimentar o jogador
function moveLeft() {
    if (playerPosition > 0) {
        playerPosition -= playerSpeed;
        player.style.left = playerPosition + 'px';
        console.log('Player moved left to:', playerPosition);
    }
}

function moveRight() {
    if (playerPosition < gameArea.offsetWidth - player.offsetWidth) {
        playerPosition += playerSpeed;
        player.style.left = playerPosition + 'px';
        console.log('Player moved right to:', playerPosition);
    }
}

// Funções para controlar eventos do teclado e touchscreen
function onKeyDown(e) {
    stopMovement(); // Garante que apenas um intervalo esteja ativo

    if (e.key === 'ArrowLeft') {
        keyInterval = setInterval(moveLeft, 50); // Movimento contínuo para a esquerda
    } else if (e.key === 'ArrowRight') {
        keyInterval = setInterval(moveRight, 50); // Movimento contínuo para a direita
    }
}

function onKeyUp() {
    stopMovement(); // Para o movimento contínuo do teclado quando a tecla for liberada
}

function onTouchStart(e) {
    stopMovement(); // Garante que apenas um intervalo esteja ativo
    const touchX = e.touches[0].clientX;
    const screenWidth = window.innerWidth;

    if (touchX < screenWidth / 2) {
        // Move continuamente para a esquerda enquanto o toque for mantido
        moveLeft();
        moveInterval = setInterval(moveLeft, 50);
    } else {
        // Move continuamente para a direita enquanto o toque for mantido
        moveRight();
        moveInterval = setInterval(moveRight, 50);
    }
}

function onTouchEnd() {
    stopMovement(); // Para o movimento contínuo do toque quando o toque for liberado
}

// Função para iniciar o jogo
function startGame() {
    introScreen.style.display = 'none';
    gameArea.style.display = 'block';
    backgroundMusic.play(); // Inicia a música de fundo

    playerPosition = gameArea.offsetWidth / 2 - player.offsetWidth / 2;
    player.style.left = `${playerPosition}px`;

    // Adiciona event listeners
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchend', onTouchEnd);

    // Função para criar bolas
    function createBall() {
        const ball = document.createElement('div');
        ball.classList.add('ball');
        ball.style.left = Math.random() * (gameArea.offsetWidth - 90) + 'px'; // Ajuste para o novo tamanho
        ball.style.top = '0px';
        gameArea.appendChild(ball);
        console.log('Ball created:', ball.style.left, ball.style.top);

        let horizontalSpeed = Math.random() < 0.5 ? -2 : 2;

        let fallInterval = setInterval(() => {
            let ballTop = parseInt(ball.style.top);
            let ballLeft = parseInt(ball.style.left);
            console.log('Ball position:', ballLeft, ballTop);

            if (ballTop + 90 > gameArea.offsetHeight - 90) {
                const playerLeft = playerPosition;
                const playerRight = playerPosition + player.offsetWidth;
                const ballRight = ballLeft + 90;

                if (ballRight > playerLeft && ballLeft < playerRight) {
                    if (!damagePlayed) {
                        playSound('damage.mp3');
                        damagePlayed = true;
                        console.log('Damage sound played.');
                    }
                    showEndScreen();
                } else {
                    score++;
                    scoreDisplay.textContent = `Pontos: ${score}`;
                    console.log('Score updated:', score);
                }

                clearInterval(fallInterval);
                gameArea.removeChild(ball);
                console.log('Ball removed.');
            } else {
                ball.style.top = ballTop + 5 + 'px';

                if (ballLeft + horizontalSpeed >= 0 && ballLeft + horizontalSpeed <= gameArea.offsetWidth - 90) {
                    ball.style.left = ballLeft + horizontalSpeed + 'px';
                } else {
                    horizontalSpeed = -horizontalSpeed;
                }
            }
        }, 20);
    }

    // Função para criar novas bolas a cada intervalo
    gameInterval = setInterval(() => {
        createBall();

        if (ballInterval > minBallInterval) {
            ballInterval -= ballIntervalDecrease;
            clearInterval(gameInterval); // Para o intervalo atual
            gameInterval = setInterval(createBall, ballInterval); // Define o novo intervalo
            console.log('Ball interval updated:', ballInterval);
        }
    }, initialBallInterval);

    // Inicia o intervalo para adicionar novas bolas após 15 segundos
    setTimeout(() => {
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(createBall, 1000); // Adiciona bolas a cada segundo
    }, 15000);
}

// Adiciona o evento de clique para iniciar o jogo
startButton.addEventListener('click', () => {
    introScreen.style.display = 'none'; // Oculta a tela inicial
    startGame(); // Inicia o jogo
});
