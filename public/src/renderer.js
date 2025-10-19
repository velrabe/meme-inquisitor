// Модуль рендеринга
import { CONFIG } from './config.js';

let canvas, ctx, w, h;
let playerImage, enemyImage;
let imagesLoaded = false;

export function initRenderer() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Загружаем изображения
    playerImage = new Image();
    enemyImage = new Image();
    
    const loadPromises = [
        new Promise((resolve, reject) => {
            playerImage.onload = resolve;
            playerImage.onerror = reject;
            playerImage.src = './img/pope.png';
        }),
        new Promise((resolve, reject) => {
            enemyImage.onload = resolve;
            enemyImage.onerror = reject;
            enemyImage.src = './img/sahur.png';
        })
    ];
    
    Promise.all(loadPromises).then(() => {
        imagesLoaded = true;
        console.log('Images loaded');
    }).catch(err => {
        console.error('Failed to load images:', err);
    });
    
    resize();
    window.addEventListener('resize', resize);
}

function resize() {
    const dpr = window.devicePixelRatio || 1;
    
    // Размеры canvas по размеру окна
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    
    // Устанавливаем размер с учетом DPR
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    
    ctx.scale(dpr, dpr);
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

export function drawPlayer(x, y, radius) {
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
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Свечение пули
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.fill();
    ctx.shadowBlur = 0;
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