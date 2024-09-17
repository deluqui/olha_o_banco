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

// Função para tocar um efeito sonoro
function playSound(src) {
    const audio = new Audio(src);
    audio.addEventListener('canplaythrough', () => {
        audio.play().catch(error => console.error('Erro ao reproduzir o áudio:', error));
    });
    audio.addEventListener('error', () => {
        console.error('Erro ao carregar o áudio:', src);
    });
}

// Função para mostrar a tela de fim de jogo
function showEndScreen() {
    gameArea.style.display = 'none';
    endScreen.style.display = 'flex'; // Exibe a tela de fim de jogo
    backgroundMusic.pause(); // Pausa a música de fundo
}

// Função para reiniciar o jogo
function restartGame() {
    endScreen.style.display = 'none'; // Oculta a tela de fim de jogo
    startGame(); // Reinicia o jogo
}

// Adiciona o evento de clique para reiniciar o jogo
restartButton.addEventListener('click', restartGame);

// Inicializa o jogo
function startGame() {
    introScreen.style.display = 'none';
    gameArea.style.display = 'block';
    backgroundMusic.play(); // Inicia a música de fundo

    // Configurações iniciais
    let playerPosition = gameArea.offsetWidth / 2 - player.offsetWidth / 2;
    const playerSpeed = 15;
    player.style.left = playerPosition + 'px';
    let score = 0;

    let moveInterval; // Variável para armazenar o intervalo do movimento contínuo (toque)
    let keyInterval;  // Variável para armazenar o intervalo do movimento contínuo (teclado)

    // Função para mover o jogador para a esquerda
    function moveLeft() {
        if (playerPosition > 0) {
            playerPosition -= playerSpeed;
            player.style.left = playerPosition + 'px';
        }
    }

    // Função para mover o jogador para a direita
    function moveRight() {
        if (playerPosition < gameArea.offsetWidth - player.offsetWidth) {
            playerPosition += playerSpeed;
            player.style.left = playerPosition + 'px';
        }
    }

    // Controle do movimento do jogador (teclado)
    document.addEventListener('keydown', (e) => {
        if (!keyInterval) {  // Evita múltiplos intervals ao segurar a tecla
            if (e.key === 'ArrowLeft') {
                keyInterval = setInterval(moveLeft, 50); // Movimento contínuo para a esquerda
            } else if (e.key === 'ArrowRight') {
                keyInterval = setInterval(moveRight, 50); // Movimento contínuo para a direita
            }
        }
    });

    document.addEventListener('keyup', () => {
        clearInterval(keyInterval); // Para o movimento contínuo do teclado quando a tecla for liberada
        keyInterval = null;
    });

    // Controle do movimento do jogador (touchscreen)
    document.addEventListener('touchstart', (e) => {
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
    });

    document.addEventListener('touchend', () => {
        clearInterval(moveInterval); // Para o movimento contínuo do toque quando o toque for liberado
    });

    // Variável para controlar o intervalo inicial de criação das bolas
    let ballInterval = 600; // Intervalo inicial em milissegundos
    const ballIntervalDecrease = 50; // Quanto o intervalo deve diminuir a cada 30 segundos
    const minBallInterval = 200; // Intervalo mínimo de criação de bolas

    // Função para criar bolas
    function createBall() {
        const ball = document.createElement('div');
        ball.classList.add('ball');
        ball.style.left = Math.random() * (gameArea.offsetWidth - 90) + 'px'; // Ajuste para o novo tamanho
        ball.style.top = '0px';
        gameArea.appendChild(ball);

        // Direção horizontal aleatória (para movimento diagonal)
        let horizontalSpeed = Math.random() < 0.5 ? -2 : 2;

        // Animação da bola caindo
        let fallInterval = setInterval(() => {
            let ballTop = parseInt(ball.style.top);
            let ballLeft = parseInt(ball.style.left);

            // Verifica se a bola colidiu com o jogador
            if (ballTop + 90 > gameArea.offsetHeight - 90) { // Ajuste para verificar colisão com a parte superior do player
                const playerLeft = playerPosition;
                const playerRight = playerPosition + player.offsetWidth;
                const ballRight = ballLeft + 90; // Ajuste para o novo tamanho

                // Ajuste de colisão para detectar quando a bola tocar as bordas e a parte superior do player
                if (ballRight > playerLeft && ballLeft < playerRight) {
                    playSound('damage.mp3'); // Adiciona o efeito sonoro
                    showEndScreen(); // Exibe a tela de fim de jogo
                } else {
                    // Se a bola passar, aumenta a pontuação
                    score++;
                    scoreDisplay.textContent = `Pontos: ${score}`;
                }

                clearInterval(fallInterval);
                gameArea.removeChild(ball);
            } else {
                ball.style.top = ballTop + 5 + 'px';

                // Movimento horizontal (diagonal)
                if (ballLeft + horizontalSpeed >= 0 && ballLeft + horizontalSpeed <= gameArea.offsetWidth - 90) {
                    ball.style.left = ballLeft + horizontalSpeed + 'px';
                } else {
                    horizontalSpeed = -horizontalSpeed; // Inverte direção horizontal se chegar às bordas
                }
            }
        }, 20);
    }

    // Função para criar novas bolas a cada intervalo
    const gameInterval = setInterval(() => {
        createBall();
        
        // Diminui o intervalo progressivamente a cada 30 segundos (30000 ms)
        if (ballInterval > minBallInterval) {
            ballInterval -= ballIntervalDecrease;
            clearInterval(gameInterval); // Para o intervalo atual
            setInterval(() => { createBall(); }, ballInterval); // Define o novo intervalo
        }
    }, ballInterval);

    // Inicia o intervalo para adicionar novas bolas após 15 segundos
    setTimeout(() => {
        setInterval(createBall, 1000); // Adiciona bolas a cada segundo após 15 segundos
    }, 15000);
}

// Adiciona o evento de clique para iniciar o jogo
startButton.addEventListener('click', startGame);
