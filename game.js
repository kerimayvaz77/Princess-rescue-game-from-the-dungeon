const prince = document.getElementById('prince');
const captivePrincess = document.getElementById('captive-princess');
const gameContainer = document.querySelector('.game-container');
const scoreElement = document.getElementById('score');
const healthElement = document.getElementById('health');
const gameOverElement = document.getElementById('game-over');
const winElement = document.getElementById('win');

// Ses efektleri
const jumpSound = document.getElementById('jumpSound');
const hitSound = document.getElementById('hitSound');
const winSound = document.getElementById('winSound');
const gameOverSound = document.getElementById('gameOverSound');
const pointSound = document.getElementById('pointSound');
const backgroundMusic = document.getElementById('backgroundMusic');
const musicButton = document.getElementById('musicButton');
const walkingSound = document.getElementById('walkingSound');
let isMusicPlaying = false;

// Klavye kontrolleri
document.addEventListener('keydown', (event) => {
    if (gameIsOver) return;

    switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            moveUp();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            moveLeft();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            moveRight();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            moveDown();
            break;
    }
});

// Ses efektlerini çalma fonksiyonu
function playSound(sound) {
    sound.currentTime = 0;
    // Yürüme sesi için özel ses seviyesi
    if (sound === walkingSound) {
        sound.volume = 1.0; // Yürüme sesi daha yüksek
    }
    sound.play().catch(error => console.log('Ses çalma hatası:', error));
}

let isJumping = false;
let gravity = 0.9;
let position = 0;
let score = 0;
let health = 3;
let gameIsOver = false;

const princePosition = {
    x: 20,
    y: gameContainer.offsetHeight - 120
};

// Prensi başlangıç pozisyonuna yerleştir
prince.style.left = princePosition.x + 'px';
prince.style.top = princePosition.y + 'px';
prince.style.display = 'block';

// Engelleri tutacak dizi
let obstacles = [];

// Prens karakterinin hareketi
function moveLeft() {
    if (!gameIsOver) {
        princePosition.x = Math.max(0, princePosition.x - 30);
        prince.style.left = princePosition.x + 'px';
        playSound(walkingSound);
        checkWinCondition();
    }
}

function moveRight() {
    if (!gameIsOver) {
        princePosition.x = Math.min(gameContainer.offsetWidth - 80, princePosition.x + 30);
        prince.style.left = princePosition.x + 'px';
        playSound(walkingSound);
        checkWinCondition();
    }
}

function moveDown() {
    if (!gameIsOver) {
        princePosition.y = Math.min(gameContainer.offsetHeight - 100, princePosition.y + 30);
        prince.style.top = princePosition.y + 'px';
        playSound(walkingSound);
        checkWinCondition();
    }
}

function moveUp() {
    if (!gameIsOver) {
        princePosition.y = Math.max(0, princePosition.y - 30);
        prince.style.top = princePosition.y + 'px';
        playSound(walkingSound);
        checkWinCondition();
    }
}

// Engel oluşturma
function createObstacle() {
    if (!gameIsOver) {
        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');

        // Rastgele engel tipi seçimi (yastık, kedi veya iğne)
        const random = Math.random();
        let type;
        
        if (random < 0.3) { // %30 ihtimalle kedi
            type = 'cat';
            obstacle.classList.add('cat');
            // Kedi gözleri
            const eyes = document.createElement('div');
            eyes.classList.add('eyes');
            obstacle.appendChild(eyes);
            
            // Kedi burnu
            const nose = document.createElement('div');
            nose.classList.add('nose');
            obstacle.appendChild(nose);
            
            // Kedi ağzı
            const mouth = document.createElement('div');
            mouth.classList.add('mouth');
            obstacle.appendChild(mouth);
            
            // Kedi bıyıkları
            const whiskersLeft = document.createElement('div');
            whiskersLeft.classList.add('whiskers-left');
            obstacle.appendChild(whiskersLeft);
            
            const whiskersRight = document.createElement('div');
            whiskersRight.classList.add('whiskers-right');
            obstacle.appendChild(whiskersRight);
            
            // Kedi kuyruğu
            const tail = document.createElement('div');
            tail.classList.add('tail');
            obstacle.appendChild(tail);
        } else if (random < 0.6) { // %30 ihtimalle yastık
            type = 'pillow';
            obstacle.classList.add('pillow');
            obstacle.textContent = "Kerim'in Kötü Şakaları";
        } else { // %40 ihtimalle iğne
            type = 'needle';
            obstacle.classList.add('needle');
            const text = document.createElement('span');
            text.textContent = "UNUTKANLIK";
            obstacle.appendChild(text);
        }

        gameContainer.appendChild(obstacle);

        const obstaclePosition = {
            x: gameContainer.offsetWidth,
            y: Math.random() * (gameContainer.offsetHeight - (type === 'cat' ? 40 : type === 'needle' ? 30 : 60))
        };

        obstacle.style.left = obstaclePosition.x + 'px';
        obstacle.style.top = obstaclePosition.y + 'px';

        obstacles.push({
            element: obstacle,
            position: obstaclePosition,
            type: type
        });
    }
}

// Engelleri hareket ettirme
function moveObstacles() {
    obstacles.forEach((obstacle, index) => {
        // Engel tipine göre hız belirleme
        let speed;
        switch(obstacle.type) {
            case 'cat':
                speed = 4;  // Kediler en hızlı
                break;
            case 'needle':
                speed = 5;  // İğneler daha da hızlı
                break;
            default:
                speed = 2;  // Yastıklar en yavaş
        }
        
        obstacle.position.x -= speed;
        obstacle.element.style.left = obstacle.position.x + 'px';

        // Çarpışma kontrolü
        if (checkCollision(obstacle)) {
            // Tüm engeller için hasar 1 olarak ayarlandı
            takeDamage(1);
            obstacle.element.remove();
            obstacles.splice(index, 1);
        }

        // Ekrandan çıkan engelleri temizleme
        if (obstacle.position.x < -100) {
            obstacle.element.remove();
            obstacles.splice(index, 1);
            score += 10;
            playSound(pointSound);
            scoreElement.textContent = `Skor: ${score}`;
        }
    });
}

// Can kaybetme
function takeDamage(damage = 1) {
    if (!gameIsOver) {
        health = Math.max(0, health - damage);
        updateHealthDisplay();
        playSound(hitSound);
        
        if (health <= 0) {
            gameOver();
        } else {
            // Karakteri yanıp söndür ve kısa süre dokunulmazlık ver
            prince.style.opacity = '0.5';
            prince.dataset.invulnerable = 'true';  // Dokunulmazlık durumunu işaretle
            
            setTimeout(() => {
                prince.style.opacity = '1';
                prince.dataset.invulnerable = 'false';  // Dokunulmazlık durumunu kaldır
            }, 1000);
        }
    }
}

// Can göstergesini güncelle
function updateHealthDisplay() {
    healthElement.textContent = `Can: ${'❤️'.repeat(health)}`;
}

// Çarpışma kontrolü
function checkCollision(obstacle) {
    // Eğer karakter dokunulmazsa çarpışma kontrolü yapma
    if (prince.dataset.invulnerable === 'true') {
        return false;
    }

    const princeRect = prince.getBoundingClientRect();
    const obstacleRect = obstacle.element.getBoundingClientRect();

    return !(princeRect.right < obstacleRect.left || 
             princeRect.left > obstacleRect.right || 
             princeRect.bottom < obstacleRect.top || 
             princeRect.top > obstacleRect.bottom);
}

// Kazanma kontrolü
function checkWinCondition() {
    const princeRect = prince.getBoundingClientRect();
    const captivePrincessRect = captivePrincess.getBoundingClientRect();

    if (!(princeRect.right < captivePrincessRect.left || 
          princeRect.left > captivePrincessRect.right || 
          princeRect.bottom < captivePrincessRect.top || 
          princeRect.top > captivePrincessRect.bottom)) {
        win();
    }
}

// Oyun döngüsü
function gameLoop() {
    if (!gameIsOver) {
        moveObstacles();
        requestAnimationFrame(gameLoop);
    }
}

// Arka plan müziğini başlat
function startBackgroundMusic() {
    backgroundMusic.volume = 0.15; // Arkaplan müziği daha kısık
    backgroundMusic.currentTime = 0;
    let playPromise = backgroundMusic.play();
    
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log('Müzik başlatma hatası:', error);
            document.addEventListener('click', function tryPlayMusic() {
                backgroundMusic.play();
                document.removeEventListener('click', tryPlayMusic);
            }, { once: true });
        });
    }
}

// Arka plan müziğini durdur
function stopBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

// Oyun bitişi
function gameOver() {
    gameIsOver = true;
    stopBackgroundMusic(); // Oyun bittiğinde müziği durdur
    playSound(gameOverSound);
    gameOverElement.classList.remove('hidden');
}

// Konfeti oluşturma fonksiyonu
function createConfetti() {
    const colors = ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9B59B6'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        document.body.appendChild(confetti);

        // Konfetileri temizle
        setTimeout(() => {
            confetti.remove();
        }, 4000);
    }
}

// Oyunu kazanma
function win() {
    gameIsOver = true;
    stopBackgroundMusic(); // Oyun kazanıldığında müziği durdur
    playSound(winSound);
    
    // Zindan kırılma animasyonu
    const dungeon = document.querySelector('.dungeon');
    dungeon.classList.add('breaking');
    
    // Prenses özgürlük animasyonu
    const princess = document.getElementById('captive-princess');
    princess.classList.add('freed');
    
    // Konfeti efekti
    createConfetti();
    
    // Biraz bekleyip win mesajını göster
    setTimeout(() => {
        winElement.classList.remove('hidden');
    }, 1000);
}

// Başlangıç ekranı kontrolü
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const gameContent = document.getElementById('game-content');

let obstacleInterval; // Engel oluşturma interval'ı için değişken

// Oyunu başlat
function startGame() {
    startScreen.style.display = 'none';
    gameContent.classList.remove('hidden');
    
    // Oyun başlangıç pozisyonlarını ayarla
    princePosition.x = 20;
    princePosition.y = gameContainer.offsetHeight - 120;
    
    // Prensi görünür yap ve pozisyonunu ayarla
    prince.style.display = 'block';
    prince.style.left = princePosition.x + 'px';
    prince.style.top = princePosition.y + 'px';
    
    // Oyun durumunu sıfırla
    gameIsOver = false;
    score = 0;
    health = 3;
    
    // Göstergeleri güncelle
    scoreElement.textContent = `Skor: ${score}`;
    updateHealthDisplay();
    
    startBackgroundMusic();
    
    // Engel oluşturmayı başlat
    obstacleInterval = setInterval(createObstacle, 2000);
    
    // Oyun döngüsünü başlat
    gameLoop();
}

// Oyunu yeniden başlatma
function restartGame() {
    // Tüm sesleri durdur
    jumpSound.pause();
    jumpSound.currentTime = 0;
    hitSound.pause();
    hitSound.currentTime = 0;
    winSound.pause();
    winSound.currentTime = 0;
    gameOverSound.pause();
    gameOverSound.currentTime = 0;
    pointSound.pause();
    pointSound.currentTime = 0;
    
    // Oyun durumunu sıfırla
    gameIsOver = false;
    score = 0;
    health = 3;
    
    startBackgroundMusic();
    
    // Göstergeleri güncelle
    scoreElement.textContent = `Skor: ${score}`;
    updateHealthDisplay();
    
    // Karakteri başlangıç pozisyonuna getir
    princePosition.x = 20;
    princePosition.y = gameContainer.offsetHeight - 120;
    prince.style.left = princePosition.x + 'px';
    prince.style.top = princePosition.y + 'px';
    prince.style.opacity = '1';
    
    // Tüm engelleri temizle
    obstacles.forEach(obstacle => obstacle.element.remove());
    obstacles = [];
    
    // Zindan ve prenses animasyonlarını sıfırla
    const dungeon = document.querySelector('.dungeon');
    const princess = document.getElementById('captive-princess');
    dungeon.classList.remove('breaking');
    princess.classList.remove('freed');
    
    // Konfetileri temizle
    const confettis = document.querySelectorAll('.confetti');
    confettis.forEach(confetti => confetti.remove());
    
    // Mesajları gizle
    gameOverElement.classList.add('hidden');
    winElement.classList.add('hidden');
    
    // Engel oluşturmayı yeniden başlat
    if (obstacleInterval) clearInterval(obstacleInterval);
    obstacleInterval = setInterval(createObstacle, 2000);
    
    // Oyun döngüsünü yeniden başlat
    gameLoop();
}

// Başlat butonuna tıklama olayı
startButton.addEventListener('click', startGame);

// Sayfa yüklendiğinde oyunu durdur
gameIsOver = true;

// Sayfa yüklendiğinde prensi konumlandır
window.onload = function() {
    princePosition.x = 20;
    princePosition.y = gameContainer.offsetHeight - 120;
    prince.style.display = 'block';
    prince.style.left = princePosition.x + 'px';
    prince.style.top = princePosition.y + 'px';
    gameIsOver = true;
};

// Belirli aralıklarla engel oluştur
setInterval(createObstacle, 2000);

// Tam ekran kontrolleri
const fullscreenButton = document.getElementById('fullscreenButton');
const gameWrapper = document.querySelector('.game-wrapper');

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        if (gameWrapper.requestFullscreen) {
            gameWrapper.requestFullscreen();
        } else if (gameWrapper.mozRequestFullScreen) { // Firefox
            gameWrapper.mozRequestFullScreen();
        } else if (gameWrapper.webkitRequestFullscreen) { // Chrome, Safari
            gameWrapper.webkitRequestFullscreen();
        } else if (gameWrapper.msRequestFullscreen) { // IE/Edge
            gameWrapper.msRequestFullscreen();
        }
        gameWrapper.classList.add('fullscreen');
        fullscreenButton.innerHTML = '<span class="fullscreen-icon">⛶</span> Küçült';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        gameWrapper.classList.remove('fullscreen');
        fullscreenButton.innerHTML = '<span class="fullscreen-icon">⛶</span> Tam Ekran';
    }
}

fullscreenButton.addEventListener('click', toggleFullScreen);

// Tam ekran değişikliklerini izle
document.addEventListener('fullscreenchange', updateFullscreenButton);
document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
document.addEventListener('mozfullscreenchange', updateFullscreenButton);
document.addEventListener('MSFullscreenChange', updateFullscreenButton);

function updateFullscreenButton() {
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
        gameWrapper.classList.remove('fullscreen');
        fullscreenButton.innerHTML = '<span class="fullscreen-icon">⛶</span> Tam Ekran';
    }
}

// Müzik kontrol fonksiyonu
function toggleMusic() {
    if (isMusicPlaying) {
        backgroundMusic.pause();
        musicButton.textContent = '🎵 Müziği Başlat';
        isMusicPlaying = false;
    } else {
        backgroundMusic.play().catch(error => {
            console.log('Müzik başlatma hatası:', error);
        });
        musicButton.textContent = '🔇 Müziği Durdur';
        isMusicPlaying = true;
    }
}

// Müzik düğmesi için olay dinleyicisi
musicButton.addEventListener('click', toggleMusic);

// Oyun başladığında müziği otomatik başlatma
document.addEventListener('click', function startInitialMusic() {
    if (!isMusicPlaying) {
        toggleMusic();
    }
    document.removeEventListener('click', startInitialMusic);
}, { once: true });

// Sayfa yüklendiğinde prensi konumlandır
window.onload = function() {
    princePosition.x = 20;
    princePosition.y = gameContainer.offsetHeight - 120;
    prince.style.display = 'block';
    prince.style.left = princePosition.x + 'px';
    prince.style.top = princePosition.y + 'px';
}; 