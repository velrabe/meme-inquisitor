// Модуль рендеринга
import { CONFIG } from './config.js';

let canvas, ctx, w, h;
let playerImage, enemyImage;
let bgTileImage, overlayImage;
let chainImage;
let imagesLoaded = false;

// Кэш для оптимизации производительности
let bgCanvas, bgCtx;
let overlayCanvas, overlayCtx;
let backgroundCached = false;
let overlayCached = false;

// Кэш градиентов
let bulletGradientCache = null;
let shootFlashGradientCache = null;

export function initRenderer() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Загружаем изображения
    playerImage = new Image();
    enemyImage = new Image();
    bgTileImage = new Image();
    overlayImage = new Image();
    chainImage = new Image();
    
    const loadPromises = [
        new Promise((resolve, reject) => {
            playerImage.onload = resolve;
            playerImage.onerror = reject;
            playerImage.src = './img/player/pope.png';
        }),
        new Promise((resolve, reject) => {
            enemyImage.onload = resolve;
            enemyImage.onerror = reject;
            enemyImage.src = './img/sahur.png';
        }),
        new Promise((resolve, reject) => {
            bgTileImage.onload = resolve;
            bgTileImage.onerror = reject;
            bgTileImage.src = './img/decorations/bg-tile.png';
        }),
        new Promise((resolve, reject) => {
            overlayImage.onload = resolve;
            overlayImage.onerror = reject;
            overlayImage.src = './img/decorations/overlay.png';
        }),
        new Promise((resolve, reject) => {
            chainImage.onload = resolve;
            chainImage.onerror = reject;
            chainImage.src = './img/player/chain.png';
        })
    ];
    
    Promise.all(loadPromises).then(() => {
        imagesLoaded = true;
        console.log('Images loaded');
        // Кэшируем фон и оверлей после загрузки изображений
        cacheBackground();
        cacheOverlay();
    }).catch(err => {
        console.error('Failed to load images:', err);
    });
    
    // Создаем офскрин-канвасы для кэширования
    bgCanvas = document.createElement('canvas');
    bgCtx = bgCanvas.getContext('2d');
    overlayCanvas = document.createElement('canvas');
    overlayCtx = overlayCanvas.getContext('2d');
    
    resize();
    window.addEventListener('resize', resize);
}

function resize() {
    const dpr = window.devicePixelRatio || 1;
    
    // Соотношение сторон 9:16 (портретный режим)
    const targetAspect = 9 / 16;
    
    // Получаем размеры экрана
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const screenAspect = screenWidth / screenHeight;
    
    // Рассчитываем размер канваса, чтобы поместился на экран и сохранил пропорции
    let displayWidth, displayHeight;
    
    if (screenAspect > targetAspect) {
        // Экран шире, чем нужно - ограничиваем по высоте
        displayHeight = screenHeight;
        displayWidth = displayHeight * targetAspect;
    } else {
        // Экран уже, чем нужно - ограничиваем по ширине
        displayWidth = screenWidth;
        displayHeight = displayWidth / targetAspect;
    }
    
    // Устанавливаем размер канваса через CSS
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    
    // Синхронизируем размеры контейнера gameUI с канвасом
    const gameUI = document.getElementById('gameUI');
    if (gameUI) {
        gameUI.style.width = `${displayWidth}px`;
        gameUI.style.height = `${displayHeight}px`;
    }
    
    // Размеры для рендеринга (соответствуют игровой арене)
    w = CONFIG.ARENA_WIDTH;
    h = CONFIG.ARENA_HEIGHT;
    
    // Устанавливаем внутренний размер канваса с учетом DPR для четкости
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    
    // Масштабируем контекст для DPR
    ctx.scale(dpr, dpr);
    
    // Обновляем размеры кэш-канвасов
    if (bgCanvas) {
        bgCanvas.width = w;
        bgCanvas.height = h;
        backgroundCached = false; // Нужно перерисовать
        if (imagesLoaded) cacheBackground();
    }
    if (overlayCanvas) {
        overlayCanvas.width = w;
        overlayCanvas.height = h;
        overlayCached = false; // Нужно перерисовать
        if (imagesLoaded) cacheOverlay();
    }
    
    // Сбрасываем кэш градиентов при изменении размера
    bulletGradientCache = null;
    shootFlashGradientCache = null;
}

export function getContext() {
    return ctx;
}

export function getSize() {
    return { w, h };
}

export function clear() {
    ctx.clearRect(0, 0, w, h);
}

// Функция для кэширования фона (вызывается один раз)
function cacheBackground() {
    if (!bgCanvas || !bgCtx || backgroundCached) return;
    
    if (imagesLoaded && bgTileImage && bgTileImage.width > 0) {
        // Рисуем тайловый фон в кэш-канвас
        const tileWidth = bgTileImage.width;
        const tileHeight = bgTileImage.height;
        
        // Рассчитываем количество тайлов по горизонтали и вертикали
        const tilesX = Math.ceil(w / tileWidth) + 1;
        const tilesY = Math.ceil(h / tileHeight) + 1;
        
        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                bgCtx.drawImage(bgTileImage, x * tileWidth, y * tileHeight);
            }
        }
        backgroundCached = true;
        console.log('Background cached');
    } else {
        // Fallback - синий градиент если изображение не загружено
        const gradient = bgCtx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        bgCtx.fillStyle = gradient;
        bgCtx.fillRect(0, 0, w, h);
        backgroundCached = true;
    }
}

// Функция для кэширования оверлея (вызывается один раз)
function cacheOverlay() {
    if (!overlayCanvas || !overlayCtx || overlayCached) return;
    
    if (imagesLoaded && overlayImage && overlayImage.width > 0) {
        // Рисуем оверлей в кэш-канвас
        overlayCtx.drawImage(overlayImage, 0, 0, w, h);
        overlayCached = true;
        console.log('Overlay cached');
    }
}

export function drawBackground() {
    // Просто копируем кэшированный фон
    if (backgroundCached && bgCanvas) {
        ctx.drawImage(bgCanvas, 0, 0);
    } else if (!imagesLoaded) {
        // Fallback только если изображения еще не загружены
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    }
}

export function drawOverlay() {
    // Просто копируем кэшированный оверлей
    if (overlayCached && overlayCanvas) {
        ctx.drawImage(overlayCanvas, 0, 0);
    }
}

export function drawPlayer(x, y, radius, shootFlash = 0) {
    // Рисуем свечение при выстреле
    if (shootFlash > 0) {
        const intensity = shootFlash / 100; // 0 до 1
        const glowRadius = radius * 0.8;
        
        // Позиция свечения - смещаем вверх к пушке
        const glowX = x;
        const glowY = y - radius * 0.7;
        
        // Используем кэшированный градиент или создаем новый
        if (!shootFlashGradientCache) {
            shootFlashGradientCache = ctx.createRadialGradient(glowX, glowY, radius * 0.2, glowX, glowY, glowRadius);
            shootFlashGradientCache.addColorStop(0, `rgba(255, 200, 50, 0.2)`);
            shootFlashGradientCache.addColorStop(0.5, `rgba(255, 150, 0, 0.1)`);
            shootFlashGradientCache.addColorStop(1, 'rgba(255, 100, 0, 0)');
        }
        
        // Применяем интенсивность через глобальную прозрачность
        ctx.save();
        ctx.globalAlpha = intensity;
        ctx.fillStyle = shootFlashGradientCache;
        ctx.beginPath();
        ctx.arc(glowX, glowY, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    // Рисуем игрока
    if (imagesLoaded && playerImage) {
        const size = radius * 2;
        ctx.drawImage(playerImage, x - radius, y - radius, size, size);
    } else {
        // Fallback если изображение не загружено
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

export function drawChain(x, y, radius, chainAngle) {
    if (imagesLoaded && chainImage && chainImage.width > 0) {
        ctx.save();
        
        // Anchor point цепи (верхняя часть, около шеи персонажа)
        const anchorX = x;
        const anchorY = y - radius * -0.1; // Смещение вниз (уменьшите коэффициент для опускания ниже)
        
        // Перемещаем контекст к anchor point
        ctx.translate(anchorX, anchorY);
        
        // Поворачиваем на угол (в радианах)
        ctx.rotate(chainAngle * Math.PI / 180);
        
        // Размер цепи - квадратная иконка с сохранением пропорций
        const chainSize = radius * 0.8; // Размер квадрата
        
        // Вычисляем aspect ratio оригинального изображения
        const aspectRatio = chainImage.width / chainImage.height;
        
        let drawWidth, drawHeight;
        if (aspectRatio >= 1) {
            // Изображение шире или квадратное
            drawWidth = chainSize;
            drawHeight = chainSize / aspectRatio;
        } else {
            // Изображение выше
            drawWidth = chainSize * aspectRatio;
            drawHeight = chainSize;
        }
        
        // Рисуем цепь как квадрат, центрированный по X
        ctx.drawImage(
            chainImage,
            -drawWidth / 2, // X - центрируем
            0, // Y - начинается от anchor point
            drawWidth,
            drawHeight
        );
        
        ctx.restore();
    }
}

export function drawEnemy(enemy) {
    const { x, y, radius, animationFrame } = enemy;
    
    if (imagesLoaded && enemyImage) {
        const size = radius * 2;
        
        // Анимированный спрайтшит - используем animationFrame для выбора кадра
        const frameWidth = enemyImage.width / CONFIG.ENEMY_ANIMATION_FRAMES;
        const frameHeight = enemyImage.height;
        const sourceX = animationFrame * frameWidth;
        
        // Рисуем один анимированный спрайт
        ctx.drawImage(
            enemyImage,
            sourceX, 0, frameWidth, frameHeight, // источник (sx, sy, sw, sh)
            x - radius, y - radius, size, size   // назначение (dx, dy, dw, dh)
        );
    } else {
        // Fallback с анимацией
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Простая анимация - изменение размера
        const animScale = 1 + Math.sin(animationFrame * 0.5) * 0.1;
        ctx.fillStyle = `rgba(255, 68, 68, ${0.7 + Math.sin(animationFrame * 0.3) * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, radius * animScale, 0, Math.PI * 2);
        ctx.fill();
    }
}

export function drawBullet(x, y, radius, color) {
    // Размеры градиентной полоски
    const bulletWidth = radius * 1.5;
    const bulletHeight = radius * 6;
    
    // Используем кэшированный градиент или создаем новый
    if (!bulletGradientCache) {
        bulletGradientCache = ctx.createLinearGradient(0, -bulletHeight / 2, 0, bulletHeight / 2);
        bulletGradientCache.addColorStop(0, 'rgba(80, 60, 20, 0.3)');
        bulletGradientCache.addColorStop(0.3, 'rgba(150, 120, 60, 0.7)');
        bulletGradientCache.addColorStop(0.7, 'rgba(255, 200, 80, 0.95)');
        bulletGradientCache.addColorStop(1, 'rgba(255, 230, 150, 1)');
    }
    
    ctx.save();
    
    // Смещаем контекст к позиции пули
    ctx.translate(x, y);
    
    // Рисуем полоску с закругленным концом
    ctx.fillStyle = bulletGradientCache;
    ctx.beginPath();
    
    // Верхняя часть (прямоугольник)
    const topY = -bulletHeight / 2;
    const bottomY = bulletHeight / 2;
    
    ctx.moveTo(-bulletWidth / 2, topY);
    ctx.lineTo(bulletWidth / 2, topY);
    ctx.lineTo(bulletWidth / 2, bottomY - bulletWidth / 2);
    
    // Закругленный низ
    ctx.arc(0, bottomY - bulletWidth / 2, bulletWidth / 2, 0, Math.PI, false);
    
    ctx.lineTo(-bulletWidth / 2, topY);
    ctx.closePath();
    ctx.fill();
    
    // Легкое свечение
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(255, 200, 80, 0.6)';
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.restore();
}

export function drawSafeZone(height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, h - height, w, height);
    
    // Линия границы
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h - height);
    ctx.lineTo(w, h - height);
    ctx.stroke();
}

export function drawPickup(pickup) {
    const { x, y, radius, color, hp, maxHp } = pickup;
    const upgrade = pickup.getUpgrade();
    
    // Основной круг бонуса
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Обводка
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Свечение
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // HP индикатор (если нужно больше 1 попадания)
    if (maxHp > 1) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x - radius, y + radius + 5, radius * 2, 6);
        
        ctx.fillStyle = color;
        const hpWidth = (radius * 2) * (hp / maxHp);
        ctx.fillRect(x - radius, y + radius + 5, hpWidth, 6);
    }
    
    // Текст с названием
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(upgrade.label, x, y);
}

export function drawActiveUpgrades(upgradeManager) {
    const effects = upgradeManager.getActiveEffects();
    if (effects.length === 0) return;
    
    const startX = 10;
    const startY = 60;
    const spacing = 30;
    
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    
    effects.forEach((effect, i) => {
        const y = startY + i * spacing;
        
        // Фон
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(startX, y, 120, 22);
        
        // Текст
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`${effect.label}: ${effect.timeLeft.toFixed(1)}s`, startX + 5, y + 14);
    });
}